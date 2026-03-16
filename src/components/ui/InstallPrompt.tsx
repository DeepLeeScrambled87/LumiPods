// Install Prompt - PWA installation banner
import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Button } from './Button';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, install, isUpdateAvailable, update } = usePWA();

  if (isUpdateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-indigo-600 text-white p-4 rounded-xl shadow-lg z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div className="flex-1">
            <h3 className="font-semibold">Update Available</h3>
            <p className="text-sm text-indigo-100 mt-1">
              A new version of LumiPods is ready!
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" onClick={update}>
                Update Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Install LumiPods</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add to your home screen for offline access and a better experience!
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {}}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
