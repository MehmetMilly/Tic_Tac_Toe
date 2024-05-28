const CACHE_NAME = 'tic-tac-toe-cache-v1';
const urlsToCache = [
  '/Tic-Tac-Toe/',
  '/Tic-Tac-Toe/index.html',
  '/Tic-Tac-Toe/style.css',
  '/Tic-Tac-Toe/script.js',
  '/Tic-Tac-Toe/icon-192x192.png',
  '/Tic-Tac-Toe/icon-512x512.png',
  '/Tic-Tac-Toe/draw-sound.mp3',
  '/Tic-Tac-Toe/loss.mp3',
  '/Tic-Tac-Toe/move-sound.mp3',
  '/Tic-Tac-Toe/restart-sound.mp3',
  '/Tic-Tac-Toe/win-sound.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
