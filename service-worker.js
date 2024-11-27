let CACHE_VERSION = 'app-v0.9';
let FILES_TO_CACHE = [
    './',
  './index.html',
  './cache-polyfill.js',
  './style.css',
  './script.js',
  './bootstrap.bundle.min.js',
  './imagen1.png',
  './icon-144.png',
  './imagen2.png',
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});self.addEventListener('fetch', function (event) {
    // Intentamos manejar la solicitud y responder solo una vez
    event.respondWith(handleSaveFilesOnCache(event));
});

async function handleSaveFilesOnCache(event) {
    // Si estamos offline, intentamos responder con la caché
    if (!navigator.onLine) {
        const cache = await caches.open(CACHE_VERSION);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            // Si encontramos el recurso en la caché, lo respondemos
            return cachedResponse;
        } else {
            // Si no hay recurso en caché, respondemos con un error
            return new Response('No estás conectado a Internet y no se encuentra el recurso.', { status: 503 });
        }
    }

    try {
        // Intentamos obtener el recurso de la red
        const response = await fetch(event.request);

        // Si la respuesta es válida (status 200), lo almacenamos en la caché
        if (response.status === 200) {
            const cache = await caches.open(CACHE_VERSION);
            // Clonamos la respuesta para almacenarla en caché sin afectar la respuesta
            cache.put(event.request, response.clone());

            // Respondemos con la respuesta obtenida de la red
            return response;
        } else {
            // Si la respuesta no es exitosa, intentamos obtenerlo de la caché
            const cache = await caches.open(CACHE_VERSION);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            } else {
                return new Response('Recurso no encontrado.', { status: 404 });
            }
        }
    } catch (error) {
        // Si hay un error al intentar realizar el fetch (por ejemplo, sin conexión)
        const cache = await caches.open(CACHE_VERSION);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            // Si encontramos un recurso en la caché, lo usamos
            return cachedResponse;
        } else {
            // Si no hay caché y no se puede acceder a la red, respondemos con un error
            return new Response('No hay conexión y no se encontró el recurso en caché.', { status: 500 });
        }
    }
}



self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key !== CACHE_VERSION) {
                    console.log('Deleting old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});