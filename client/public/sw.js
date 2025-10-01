const CACHE_NAME = "legacy-grand-cache-v2"; // bump on deploy
const STATIC_ASSETS = [
  "/favicon.ico",
  "/manifest.json"
  // don't cache index.html here
];

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  /* eslint-disable-next-line no-restricted-globals */
  self.skipWaiting();
});

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  /* eslint-disable-next-line no-restricted-globals */
  self.clients.claim();
});

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // ✅ Network-first for HTML
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }
  
  // ✅ Network-first for API (only cache GET requests)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache GET requests
          if (event.request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Only try to retrieve GET requests from cache
          if (event.request.method === "GET") {
            return caches.match(event.request);
          }
          // Return error response for non-GET requests
          return new Response(
            JSON.stringify({ error: "Network error" }), 
            {
              status: 503,
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }
  
  // ✅ Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
