const CACHE_NAME = 'ambuj-portfolio-cache-v7'; // v6 को v7 कर दो ताकि पुराना कैश हटे
const urlsToCache = [
  '/Ambuj_AI_Portfolio/', // एब्सोल्यूट पाथ
  '/Ambuj_AI_Portfolio/index.html',
  '/Ambuj_AI_Portfolio/icons/icon-192x192.png',
  '/Ambuj_AI_Portfolio/icons/icon-512x512.png',
  '/Ambuj_AI_Portfolio/favicon.ico' // favicon जोड़ो (अगर बनाया है)
  // अगर PDFs जोड़नी हैं, तो नीचे जैसे लाइनें जोड़ सकते हो:
  // '/Ambuj_AI_Portfolio/pdfs/presentation1.pdf',
  // '/Ambuj_AI_Portfolio/pdfs/presentation2.pdf',
  // '/Ambuj_AI_Portfolio/pdfs/presentation3.pdf',
  // '/Ambuj_AI_Portfolio/pdfs/presentation4.pdf'
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
          if (!cacheWhitelist.includes(cacheName)) {
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
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
          });
      })
  );
});