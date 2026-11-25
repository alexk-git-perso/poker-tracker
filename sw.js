// Hors ligne. Stratégie « réseau d'abord » : en ligne on charge toujours la dernière version,
// hors ligne on sert la copie en cache. La version vient de js/version.js (node tools/bump.mjs).
importScripts('js/version.js');
const VERSION = 'poker-' + self.APP_VERSION;
const FONTS = 'poker-fonts';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/version.js', 'js/app.js', 'js/db.js', 'js/stats.js', 'js/share.js', 'js/format.js', 'js/profile.js', 'js/live.js', 'js/cards.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' contourne le cache HTTP du navigateur (sinon on pourrait remettre en cache d'anciens fichiers)
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req); c.put(req, res.clone()); return res;
    }).catch(() => fetch(req)));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(async () => (await caches.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
