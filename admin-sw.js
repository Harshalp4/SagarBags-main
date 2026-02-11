/* ========================================
   SAGAR BAGS ADMIN - Service Worker
   PWA offline support and caching
   ======================================== */

const CACHE_NAME = 'sagar-bags-admin-v1';
const STATIC_CACHE = 'sagar-bags-admin-static-v1';
const DYNAMIC_CACHE = 'sagar-bags-admin-dynamic-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/admin-dashboard.html',
  '/admin.html',
  '/assets/css/styles.css',
  '/assets/css/responsive.css',
  '/assets/css/admin.css',
  '/assets/js/admin.js',
  '/assets/images/admin-icon-192.png',
  '/assets/images/admin-icon-512.png',
  '/admin-manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Admin SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Admin SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.log('[Admin SW] Cache failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Admin SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => {
              console.log('[Admin SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Firebase/external API requests - always go to network
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic')) {
    return;
  }

  // For admin pages - network first strategy
  if (url.pathname.includes('admin')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For static assets - cache first strategy
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default - network first
  event.respondWith(networkFirst(request));
});

// Network first strategy - try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Admin SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/admin-offline.html');
    }

    throw error;
  }
}

// Cache first strategy - try cache, fallback to network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Admin SW] Failed to fetch:', request.url);
    throw error;
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      })
    );
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[Admin SW] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Future: sync offline changes when back online
  console.log('[Admin SW] Syncing data...');
}
