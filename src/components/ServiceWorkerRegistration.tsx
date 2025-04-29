"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { areRemindersEnabled, scheduleAllReminders } from '@/utils/notifications';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // Register service worker after component mounts (client-side only)
    registerServiceWorker();
    
    // Schedule reminders if they're enabled
    if (areRemindersEnabled()) {
      scheduleAllReminders();
    }
  }, []);

  // This is a utility component that doesn't render anything
  return null;
};

export default ServiceWorkerRegistration;
