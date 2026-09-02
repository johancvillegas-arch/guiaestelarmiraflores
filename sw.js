const CACHE = 'guia-estelar-v2';

const PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/places.json',
  '/manifest.json',
  '/icons/icon.svg',
  '/lib/leaflet.js',
  '/lib/leaflet.css',
  '/lib/images/marker-icon.png',
  '/lib/images/marker-icon-2x.png',
  '/lib/images/marker-shadow.png',
  '/lib/images/layers.png',
  '/lib/images/layers-2x.png',
];

// Instalar: pre-cachear archivos locales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activar: eliminar caches obsoletos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: servir desde cache; actualizar cache en segundo plano
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);   // Sin red: devolver caché si existe

      return cached || networkFetch;
    })
  );
});
