const CACHE = "habla-v2.2";
const FILES = [
  "./",
  "index.html",
  "css/app.css",
  "js/app.js",
  "js/celebrate.js",
  "js/util.js",
  "js/srs.js",
  "js/store.js",
  "js/quiz.js",
  "js/speech.js",
  "js/deck.js",
  "js/scene.js",
  "js/data/sets.js",
  "manifest.json",
  "icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((res) => {
        if (!res.ok) return res;
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      }).catch(() => caches.match("index.html"));
    })
  );
});
