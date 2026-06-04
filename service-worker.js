// Service Worker - GameVault
// Versão 1.0.0 - Cache-first strategy para offline

const CACHE_NAME = 'gamevault-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: Cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        // Se algum asset não existir, apenas continua
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Remove caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy (offline support)
self.addEventListener('fetch', (e) => {
  // Skip para requisições não-GET
  if (e.request.method !== 'GET') {
    return;
  }

  // Skip para requisições de protocolos especiais
  if (!e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      // Se encontrou no cache, retorna
      if (response) {
        return response;
      }

      // Caso contrário, tenta network
      return fetch(e.request).then((response) => {
        // Valida a response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone a response para cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });

        return response;
      }).catch(() => {
        // Se network falhar, tenta cache
        return caches.match(e.request).then((response) => {
          if (response) {
            return response;
          }

          // Se nada funcionar, retorna offline page (índice em cache)
          return caches.match('/index.html');
        });
      });
    })
  );
});

// Background Sync (quando voltar online)
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-data') {
    e.waitUntil(syncData());
  }
});

async function syncData() {
  // Placeholder para sincronização futura
  console.log('[SW] Sincronizando dados com servidor...');
  return Promise.resolve();
}

// Message handler para comunicação com a página
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
