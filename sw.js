const CACHE_NAME = 'cbms-pwa-v1';
const urlsToCache = [
  '/',
  '/Index.html',
  '/src/main.css',
  '/src/main.js',
  '/src/assets/image.png',
  '/src/assets/cbms-removebg-preview.png',
  '/src/assets/cbms.png',
  // Add more assets as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
