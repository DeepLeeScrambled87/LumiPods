import { useEffect } from 'react';
import { toast } from 'sonner';
import { syncReturnedExternalSessions } from '../services/externalProgressSyncService';

export const useExternalSessionTracker = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    let isSyncing = false;

    const runSync = async () => {
      if (isSyncing) {
        return;
      }

      isSyncing = true;
      try {
        const synced = await syncReturnedExternalSessions();
        if (synced.length === 0) {
          return;
        }

        if (synced.length === 1) {
          const [{ trackedMinutes, session, learnerName }] = synced;
          toast.success(
            `${learnerName || 'Learner'} tracked ${trackedMinutes} min in ${session.platformName}`
          );
          return;
        }

        toast.success(`Synced ${synced.length} tracked external sessions`);
      } finally {
        isSyncing = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runSync();
      }
    };

    void runSync();

    const handleFocus = () => {
      void runSync();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
};
