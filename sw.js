const CACHE_NAME = 'ambuj-portfolio-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Service Worker: Cache add error', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache mein request mil gayi, to response wapas kar do
        if (response) {
          return response;
        }

        // Agar cache mein nahi mili, to network se fetch karo aur cache mein daal do
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then((fetchResponse) => {
            // Check karo ki response sahi hai ya nahi
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Response ka clone banao
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            // Agar offline hain aur cache mein bhi nahi hai, to ek fallback page return kar sakte hain
            // return caches.match('./offline.html');
          });
      })
  );
});
