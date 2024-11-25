// Nombre de la versión del caché
const CACHE_VERSION = 'app-v0.01';
const CACHE_FILES = [
  './',
  'index.html',
  'cache-polyfill.js',
  'style.css',
  'script.js',
  'bootstrap.bundle.min.js',
  'imagen1.png',
  'icon-144.png',
  'imagen2.png',
];

// Instalación del Service Worker
self.addEventListener('install', function (event) {
  // Forzar que este SW tome control de inmediato
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      console.log('Abriendo caché...');
      return cache.addAll(CACHE_FILES);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      // Borrar cachés antiguas
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_VERSION) {
            console.log('Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Manejo de solicitudes (fetch)
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      // Si el recurso está en la caché, úsalo
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en la caché, intenta buscarlo en la red
      return fetch(event.request)
        .then(function (networkResponse) {
          // Almacena en caché dinámicamente el recurso
          return caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(function () {
          // Maneja el caso en que la red y la caché fallan (opcional)
          return caches.match('./offline.html'); // Asegúrate de tener un archivo de respaldo
        });
    })
  );
});
