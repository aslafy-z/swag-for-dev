self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('devswag').then(function (cache) {
            return cache.addAll([
                '/',
                '/assets/img/logo.png',
                '/assets/css/index-18a33c4529.css',
                '/assets/js/index-226706dba4.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log(event.request.url);

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
