"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { areRemindersEnabled, setupReminderChecks } from '@/utils/notifications';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // Register service worker after component mounts (client-side only)
    registerServiceWorker();

    // Setup reminder checks if they're enabled
    if (areRemindersEnabled()) {
      const cleanup = setupReminderChecks();
      return cleanup; // Cleanup on unmount
    }
  }, []);

  // This is a utility component that doesn't render anything
  return null;
};

export default ServiceWorkerRegistration;
