// Service Worker for Push Notifications & Offline Cache - Plantão Pro
// IMPORTANT: bump APP_VERSION on every UI/theme/header/footer release so that
// installed clients evict the previous cached shell and apply changes without
// reload loops.
const APP_VERSION = 'v10-2026-07-02-android-cache-cool';
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

// ---------------------------------------------------------------------------
// Fetch strategy (Android-cool + no reload loops)
// ---------------------------------------------------------------------------
// - Navigations (HTML)         : network-first (4s), no cache write
// - Supabase /auth/v1          : pass-through
// - Supabase other             : pass-through (evita CPU/cache no Android)
// - Same-origin hashed assets  : cache-first + immutable (Vite: -[hash].ext)
// - Same-origin non-hashed JS/CSS/JSON : network-first (5s) → cache fallback
// - Same-origin static binaries: cache-first
// - Range requests / non-GET   : bypass (evita duplicar streams)
// ---------------------------------------------------------------------------

const NAV_TIMEOUT_MS = 4000;
const ASSET_TIMEOUT_MS = 5000;
const MAX_DYNAMIC_ENTRIES = 40;

// Vite hashed asset: something like main-BQ8kZ2.js, index-a1b2c3d4.css
const HASHED_ASSET_RE = /[.-][a-f0-9]{8,}\.(js|css|woff2?|png|jpe?g|webp|svg|gif|ico|mp3|mp4)$/i;

function timedFetch(request, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('sw-timeout')), ms);
    fetch(request)
      .then((r) => { clearTimeout(t); resolve(r); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      const excess = keys.length - maxEntries;
      await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
    }
  } catch {}
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Range requests (video/audio streaming) — never intercept
  if (request.headers.get('range')) return;

  const url = new URL(request.url);

  // 1) HTML navigations: network-first w/ timeout, no cache write → sem loops
  if (request.mode === 'navigate') {
    event.respondWith(
      timedFetch(request, NAV_TIMEOUT_MS).catch(
        () => new Response(
          '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
          '<body style="background:#0a0f1a;color:#f59e0b;font-family:sans-serif;' +
          'display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">' +
          '<div><h1>Sem conexão</h1><p>Recarregue quando a rede voltar.</p></div>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      )
    );
    return;
  }

  // 2) Supabase — pass-through completo
  if (url.hostname.includes('supabase.co')) return;

  // 3) Only handle same-origin from here
  if (url.origin !== self.location.origin) return;

  // 4) Hashed assets: cache-first (imutáveis por natureza — nunca revalida)
  if (HASHED_ASSET_RE.test(url.pathname)) {
    event.respondWith(cacheFirstImmutable(request));
    return;
  }

  // 5) Static non-hashed binaries (ícones do manifest, favicon): cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstImmutable(request));
    return;
  }

  // 6) Non-hashed JS/CSS/JSON (raro): network-first evita servir versão velha
  if (/\.(js|css|json)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }
  // Restante: deixa o browser lidar
});

function isStaticAsset(pathname) {
  return /\.(png|jpe?g|gif|svg|ico|woff2?|ttf|otf|mp3|mp4|webp)$/i.test(pathname);
}

async function cacheFirstImmutable(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await timedFetch(request, ASSET_TIMEOUT_MS);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, res.clone()).catch(() => {});
    }
    return res;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  try {
    const res = await timedFetch(request, ASSET_TIMEOUT_MS);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, res.clone()).catch(() => {});
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES);
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('', { status: 504, statusText: 'Offline' });
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
