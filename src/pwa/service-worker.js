var dataCacheName = 'connect19Data-v1';
var cacheName = 'connect19PWA-final-1';
var filesToCache = [
  '/',
  '../',
  '../index.html',
  '../scripts/main.min.js',
  '../styles/main.min.css',
  '../images/attachment.svb',
  '../images/back.svg',
  '../images/default.png',
  '../images/dummy.png',
  '../images/logo--.svg',
  '../images/logo-new.svg',
  '../images/logo.png',
  '../images/logo.svg',
  '../images/prof-img.png',
  '../images/send.svg',
  '../images/waves.svg'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  return self.clients.claim();
});

