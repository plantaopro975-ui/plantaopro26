// Service Worker for Push Notifications & Offline Cache - Plantão Pro
// IMPORTANT: bump APP_VERSION on every UI/theme/header/footer release so that
// installed clients evict the previous cached shell and apply changes without
// reload loops.
const APP_VERSION = 'v5-2026-06-24';
const STATIC_CACHE = `plantao-pro-static-${APP_VERSION}`;
const DYNAMIC_CACHE = `plantao-pro-dynamic-${APP_VERSION}`;
const VALID_CACHES = new Set([STATIC_CACHE, DYNAMIC_CACHE]);

// Only truly static binary assets are precached. HTML, JS and CSS are NEVER
// precached/cached so theme + layout changes always reach the user.
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png'
];

// Install: precache only safe binary assets, then activate immediately.
self.addEventListener('install', (event) => {
  console.log('[SW] Installing', APP_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[SW] Some static assets failed to cache:', err);
      })
    )
  );
  self.skipWaiting();
});

// Activate: nuke every cache that doesn't match the current APP_VERSION,
// then notify open clients ONCE so they can refresh without loops.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating', APP_VERSION);
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => !VALID_CACHES.has(name))
        .map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
    );
    await self.clients.claim();
    const wins = await self.clients.matchAll({ type: 'window' });
    wins.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', version: APP_VERSION }));
  })());
});

// Fetch event - Network first with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Navigations (HTML): ALWAYS network, NEVER cache the response.
  // Stale HTML pointing at deleted JS chunks is the root cause of reload loops.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/manifest.json').then(() => new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // Handle API requests (Supabase)
  // CRITICAL: never cache authentication endpoints (can break session persistence)
  if (url.hostname.includes('supabase.co')) {
    if (url.pathname.includes('/auth/v1')) {
      // Always go to network for auth
      event.respondWith(fetch(request));
      return;
    }

    // Other API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle same-origin requests
  if (url.origin === self.location.origin) {
    // Static assets (images/fonts/etc.) - Cache first
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(request));
    } else {
      // Everything else - Network first
      event.respondWith(networkFirst(request));
    }
    return;
  }
});

// Check if URL is a static asset
function isStaticAsset(pathname) {
  // Only cache truly static binary assets.
  // IMPORTANT: do NOT cache JS/CSS/HTML here to avoid stale builds causing auth refresh storms.
  const staticExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.otf',
    '.mp3', '.mp4'
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy (for dynamic content)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle API requests with smart caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cacheKey = `api:${url.pathname}${url.search}`;
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests (excluding auth endpoints)
    if (
      networkResponse.ok &&
      request.method === 'GET' &&
      !url.pathname.includes('/auth/v1')
    ) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);

      // Create a response with timestamp header
      const responseBody = await responseClone.text();
      const cachedResponse = new Response(responseBody, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers),
          'x-cached-at': new Date().toISOString()
        }
      });

      cache.put(cacheKey, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, checking cache:', cacheKey);
    
    const cachedResponse = await caches.match(cacheKey);
    if (cachedResponse) {
      console.log('[SW] Returning cached API response');
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {
    title: 'Plantão Pro',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    tag: 'default',
    url: '/agent-panel'
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/agent-panel',
      type: data.type || 'general'
    },
    actions: getActionsForType(data.type),
    requireInteraction: true,
    tag: data.tag || 'plantao-pro-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Get appropriate actions based on notification type
function getActionsForType(type) {
  switch (type) {
    case 'birthday':
      return [
        { action: 'view', title: '🎉 Ver Perfil' },
        { action: 'close', title: 'Fechar' }
      ];
    case 'shift':
      return [
        { action: 'view', title: '📋 Ver Plantão' },
        { action: 'close', title: 'Fechar' }
      ];
    case 'shift-reminder':
      return [
        { action: 'view', title: '⏰ Ver Detalhes' },
        { action: 'close', title: 'Fechar' }
      ];
    default:
      return [
        { action: 'view', title: 'Ver' },
        { action: 'close', title: 'Fechar' }
      ];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const url = event.notification.data?.url || '/agent-panel';

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(url);
            }
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Periodic sync for background checks (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkForNotifications());
  }
  if (event.tag === 'sync-data') {
    event.waitUntil(syncCachedData());
  }
});

async function checkForNotifications() {
  console.log('[SW] Checking for notifications...');
}

async function syncCachedData() {
  console.log('[SW] Syncing cached data...');
  // This would sync any pending offline changes
}

// Background sync for pending offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges() {
  console.log('[SW] Syncing pending changes...');
  // Notify clients that we're syncing
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_STARTED' });
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, url, notificationType } = event.data;
    
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: tag || 'message-notification',
      data: { url: url || '/agent-panel', type: notificationType },
      actions: getActionsForType(notificationType),
      requireInteraction: true,
      renotify: true
    });
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});
