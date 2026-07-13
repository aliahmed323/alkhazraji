const CACHE = 'khazraji-v1';
const ASSETS = ['./', './index.html', './js/app.js', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Network-first for Firebase
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for everything else
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.status === 200) {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
    }
    return resp;
  })));
});