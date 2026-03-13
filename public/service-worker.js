const CACHE_NAME = 'mini-linkedin-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/feed.html',
  '/profile.html',
  '/notifications.html',
  '/css/styles.css',
  '/js/auth.js',
  '/js/feed.js',
  '/js/profile.js',
  '/js/notifications.js',
  '/js/firebase-config.js',
  '/images/pwa-icon-192.png',
  '/images/pwa-icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch Strategy: Network First, falling back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
