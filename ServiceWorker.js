const cacheName = "MasterMinds-LightingConsole-0.9.7"; // Increment version when updating
const contentToCache = [
  "/",
  "index.html",                // Main entry point
  "offline.html",               // Offline fallback page
  "manifest.json",              // PWA manifest
  "favicon.ico",                // Favicon
  "Build/webGL (PWA).loader.js", 
  "Build/webGL (PWA).framework.js",
  "Build/webGL (PWA).data",
  "Build/webGL (PWA).wasm",
  "TemplateData/style.css",
  "TemplateData/logo-512.png", // Example logos
  "TemplateData/logo-192.png",
  // Add any additional static files you need to cache here
];

// Install event: cache all files listed in `contentToCache`
self.addEventListener('install', function (e) {
  console.log('[Service Worker] Installing...');
  e.waitUntil((async function () {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching essential files...');
    await cache.addAll(contentToCache);
  })());
});

// Activate event: Ensure the new service worker immediately takes control
self.addEventListener('activate', function (e) {
  console.log('[Service Worker] Activated');
  e.waitUntil(clients.claim()); // Take control of the page immediately
});

// Fetch event: serve cached files when the network is unavailable
self.addEventListener('fetch', function (e) {
  e.respondWith((async function () {
    // Try to fetch the requested resource from the cache first
    const cachedResponse = await caches.match(e.request);
    if (cachedResponse) {
      console.log(`[Service Worker] Serving cached resource: ${e.request.url}`);
      return cachedResponse;
    }

    // If not in cache, attempt to fetch from the network
    try {
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      // Cache the new response for future use
      cache.put(e.request, response.clone());
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      return response;
    } catch (error) {
      // Fallback: serve offline page if the network is unavailable
      console.log('[Service Worker] Network request failed, returning offline page');
      return caches.match('offline.html');
    }
  })());
});
