// Hors ligne : l'appli est mise en cache à l'installation. Changer VERSION à chaque mise en ligne.
const VERSION = 'poker-v6';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/db.js', 'js/stats.js', 'js/share.js', 'js/format.js', 'js/profile.js', 'js/live.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Polices Google : mises en cache au premier chargement
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fonts').then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req); c.put(req, res.clone()); return res;
    }).catch(() => fetch(req)));
    return;
  }
  if (url.origin !== location.origin) return;
  // Fichiers de l'appli : cache d'abord, réseau en secours
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
