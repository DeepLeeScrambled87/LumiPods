// Database hook - Manages PocketBase connection with localStorage fallback
import { useState, useEffect, useCallback, useRef } from 'react';
import { pb } from '../lib/pocketbase';
import { storage } from '../lib/storage';

export type ConnectionStatus = 'connected' | 'offline' | 'connecting' | 'error';

interface UseDatabaseReturn {
  status: ConnectionStatus;
  isOnline: boolean;
  lastSyncAt: Date | null;
  pendingSyncs: number;
  sync: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

const SYNC_QUEUE_KEY = 'sync-queue';
const LAST_SYNC_KEY = 'last-sync';

interface SyncQueueItem {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: string;
}

export const useDatabase = (): UseDatabaseReturn => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const syncInProgress = useRef(false);

  // Check connection on mount and periodically
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      await pb.health.check();
      setStatus('connected');
      return true;
    } catch {
      setStatus('offline');
      return false;
    }
  }, []);

  // Load pending syncs count
  useEffect(() => {
    const queue = storage.get<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
    setPendingSyncs(queue.length);
    
    const lastSync = storage.get<string | null>(LAST_SYNC_KEY, null);
    if (lastSync) {
      setLastSyncAt(new Date(lastSync));
    }
  }, []);

  // Initial connection check
  useEffect(() => {
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Listen for online/offline events
    const handleOnline = () => checkConnection();
    const handleOffline = () => setStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Sync pending changes when connection is restored
  const sync = useCallback(async () => {
    if (syncInProgress.current || status !== 'connected') return;
    
    syncInProgress.current = true;
    const queue = storage.get<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
    
    if (queue.length === 0) {
      syncInProgress.current = false;
      return;
    }

    const failedItems: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        switch (item.operation) {
          case 'create':
            await pb.collection(item.collection).create(item.data);
            break;
          case 'update':
            await pb.collection(item.collection).update(item.data.id as string, item.data);
            break;
          case 'delete':
            await pb.collection(item.collection).delete(item.data.id as string);
            break;
        }
      } catch (error) {
        console.error(`Sync failed for ${item.collection}:`, error);
        failedItems.push(item);
      }
    }

    storage.set(SYNC_QUEUE_KEY, failedItems);
    setPendingSyncs(failedItems.length);
    
    const now = new Date();
    setLastSyncAt(now);
    storage.set(LAST_SYNC_KEY, now.toISOString());
    
    syncInProgress.current = false;
  }, [status]);

  // Auto-sync when connection is restored
  useEffect(() => {
    if (status === 'connected' && pendingSyncs > 0) {
      sync();
    }
  }, [status, pendingSyncs, sync]);

  return {
    status,
    isOnline: status === 'connected',
    lastSyncAt,
    pendingSyncs,
    sync,
    checkConnection,
  };
};

// Helper to queue an operation for sync
export const queueSync = (
  collection: string,
  operation: 'create' | 'update' | 'delete',
  data: Record<string, unknown>
): void => {
  const queue = storage.get<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  queue.push({
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    collection,
    operation,
    data,
    timestamp: new Date().toISOString(),
  });
  storage.set(SYNC_QUEUE_KEY, queue);
};

export default useDatabase;
