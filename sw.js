/**
 * Service Worker - Game Hub
 * מאפשר cache בסיסי לתמיכה Offline
 */
const CACHE_NAME = "gamehub-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/pages/home/index.html",
  "/pages/login/index.html",
  "/pages/games/tic-tac-toe/index.html",
  "/pages/games/snake/index.html",
  "/css/app.css",
  "/js/auth.js",
  "/js/app-common.js",
  "/js/standalone.js",
  "/js/toast.js",
  "/js/sounds.js",
  "/assets/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate" && !e.request.url.match(/\.(js|css|svg|woff2?)$/)) return;
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const clone = res.clone();
      if (res.ok && (e.request.mode === "navigate" || e.request.url.match(/\.(js|css|svg)$/)))
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
      return res;
    }))
  );
});
