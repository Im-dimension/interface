// Service worker with no caching
// All caching disabled for development

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // No caching - just fetch directly from network
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', (event) => {
  // Clear all existing caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Take control of all clients immediately
  return self.clients.claim();
});

