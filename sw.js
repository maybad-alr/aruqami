/* أرقامي — Service Worker: تخزين مؤقت للعمل دون اتصال */
const CACHE = 'aruqami-v1';
const SHELL = ['./', './index.html', './assets/css/main.css', './assets/js/app.js',
  './manifest.webmanifest', './favicon.svg', './logo.svg', './calculators/end-of-service.html',
  './calculators/zakat.html', './calculators/vat.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .catch(function () {})
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isHtml = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  /* الصفحات: الشبكة أولًا حتى يبقى المحتوى محدثًا دائمًا */
  if (isHtml) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }

  /* الملفات الثابتة: الكاش أولًا مع تحديث في الخلفية */
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
