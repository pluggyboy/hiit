// Service Worker for HIIT Timer App
// This service worker helps with sending notifications even when the browser is closed

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push notification received', data);

  const title = data.title || 'HIIT Workout Reminder';
  const options = {
    body: data.body || 'Time for your workout! Keep that streak going!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    },
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();

  // Open the app when notification is clicked
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      const matchingClient = windowClients.find((client) => {
        return client.url === urlToOpen;
      });

      // If so, focus it
      if (matchingClient) {
        return matchingClient.focus();
      }
      
      // If not, open a new window/tab
      return clients.openWindow(urlToOpen);
    })
  );
});

// Simple fetch handler for offline support
self.addEventListener('fetch', (event) => {
  // For now, just use the browser's default fetch behavior
  // In a real app, you'd implement caching strategies here
  event.respondWith(fetch(event.request));
});
