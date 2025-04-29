// Service worker registration utility

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          return registration;
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Check if Push API is supported
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

// Request push notification permission and subscribe
export async function subscribeToPushNotifications() {
  if (!isPushSupported()) {
    return false;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Subscribe to push notifications
    // In a real app, this would include a backend server that would generate VAPID keys
    // and handle sending push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // In a real application, you would include application server keys here
      // applicationServerKey: urlBase64ToUint8Array('your_public_key_here')
    });

    console.log('Push notification subscription:', subscription);
    
    // In a real app, you would send the subscription to your server
    // await sendSubscriptionToServer(subscription);
    
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

// Helper function to convert base64 string to Uint8Array
// This would be used with actual VAPID keys in a real application
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
