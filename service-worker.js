const CACHE_NAME = "music-notes-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Installazione del Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching delle risorse");
      return cache.addAll(urlsToCache);
    })
  );
});

// Attivazione del Service Worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Eliminazione cache vecchia:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Gestione delle richieste
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
