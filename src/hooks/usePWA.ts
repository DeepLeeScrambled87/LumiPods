// PWA Hook - Service worker registration and install prompt
import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  install: () => Promise<boolean>;
  update: () => void;
}

export const usePWA = (): UsePWAReturn => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    if (!import.meta.env.PROD) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch((err) => console.error('Failed to unregister service workers in dev:', err));

      if ('caches' in window) {
        caches.keys()
          .then((cacheNames) =>
            Promise.all(
              cacheNames
                .filter((cacheName) => cacheName.startsWith('lumipods-'))
                .map((cacheName) => caches.delete(cacheName))
            )
          )
          .catch((err) => console.error('Failed to clear caches in dev:', err));
      }

      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker registered');
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((err) => console.error('Service Worker registration failed:', err));

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install the PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [installPrompt]);

  // Apply update
  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  return {
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    install,
    update,
  };
};

export default usePWA;
