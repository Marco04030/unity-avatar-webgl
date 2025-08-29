// Minimal cache-first Service Worker for Unity WebGL builds
const CACHE_NAME = 'unity-offline-v1';
const RUNTIME_PATHS = [/\/Build\//, /\/TemplateData\//, /index\.html$/];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = self.location.origin === url.origin;
  const matches = isSameOrigin && RUNTIME_PATHS.some((r) => r.test(url.pathname));
  if (!matches) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request);
        cache.put(request, resp.clone());
        return resp;
      } catch (_err) {
        return cached || new Response('Offline', { status: 503 });
      }
    })
  );
});


