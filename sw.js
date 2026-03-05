const CACHE_NAME = 'keuanganku-v4-debt-tracking';
const urlsToCache = [
    './index.html',
    './manifest.json',
    './icon-192x192.png',
    './icon-512x512.png',
    'https://unpkg.com/dexie/dist/dexie.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    self.skipWaiting(); // Memaksa PWA langsung meng-update tanpa menunggu Chrome ditutup
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache v3');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim()); // Langsung mengambil alih kontrol halaman
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch dari Cache atau Network
self.addEventListener('fetch', event => {
    // Hanya intercept HTTP/HTTPS, hindari request extension chrome
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Mengembalikan file dari cache jika ada, jika tidak lakukan fetch dari network
                    return response || fetch(event.request);
                })
        );
    }
});
