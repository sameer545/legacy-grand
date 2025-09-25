// public/sw.js

const CACHE_NAME = "legacy-grand-cache-v1";

// ✅ Static assets to cache (add more if needed)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/manifest.json"
];

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  /* eslint-disable-next-line no-restricted-globals */
  self.skipWaiting();
});

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  /* eslint-disable-next-line no-restricted-globals */
  self.clients.claim();
});

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle API calls (network first, fallback to cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Handle static assets (cache first, fallback to network)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});