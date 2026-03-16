// Sync Status Indicator - Shows connection status and pending syncs
import React from 'react';
import { useDatabase } from '../../hooks/useDatabase';

export const SyncStatus: React.FC = () => {
  const { status, pendingSyncs, lastSyncAt, sync } = useDatabase();

  const statusConfig = {
    connected: { color: 'bg-green-500', icon: '●', label: 'Online' },
    offline: { color: 'bg-yellow-500', icon: '○', label: 'Offline' },
    connecting: { color: 'bg-blue-500', icon: '◐', label: 'Connecting...' },
    error: { color: 'bg-red-500', icon: '✕', label: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className="text-gray-600 dark:text-gray-400">{config.label}</span>
      
      {pendingSyncs > 0 && (
        <button
          onClick={() => sync()}
          className="flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
          title={`${pendingSyncs} changes pending sync`}
        >
          <span>↑</span>
          <span>{pendingSyncs}</span>
        </button>
      )}
      
      {lastSyncAt && status === 'connected' && pendingSyncs === 0 && (
        <span className="text-xs text-gray-400">
          Synced {formatRelativeTime(lastSyncAt)}
        </span>
      )}
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}

export default SyncStatus;
