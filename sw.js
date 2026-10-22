// Cache everything on install so the app works fully offline (planes, car rides).
const CACHE = 'little-learners-v2';
const FILES = ['./', 'index.html', 'art.js', 'fonts/fredoka.woff2', 'manifest.json', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Serve from cache instantly (works offline), and refresh the cache in the background when online.
// waitUntil keeps the worker alive until the refreshed copy is saved.
self.addEventListener('fetch', e => {
  const refresh = caches.open(CACHE).then(c => fetch(e.request, { cache: 'no-cache' })
    .then(r => r.ok ? c.put(e.request, r.clone()).then(() => r) : r));
  e.waitUntil(refresh.catch(() => {}));
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || refresh));
});
