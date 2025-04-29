"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/serviceWorker';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // Register service worker after component mounts (client-side only)
    registerServiceWorker();
  }, []);

  // This is a utility component that doesn't render anything
  return null;
};

export default ServiceWorkerRegistration;
