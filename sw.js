// My Gallery service worker：讓 app 在沒有網路時也能打開
const VERSION = 'mg-v18';
const SHELL = ['./', 'index.html', 'style.css', 'db.js', 'zh.js', 'i18n.js', 'ai.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com');
  const isLib = url.host.includes('cdnjs.cloudflare.com');
  if (!sameOrigin && !isFont && !isLib) return; // AI、地圖圖磚等一律走網路
  // App 本身的檔案：每次都跟伺服器確認有沒有新版（不用瀏覽器的暫存），沒網路才用快取
  if (sameOrigin) {
    e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res && res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }))));
    return;
  }
  // 字型與地圖程式庫：先給快取、背景更新
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: sameOrigin });
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
