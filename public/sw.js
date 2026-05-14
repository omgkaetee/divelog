const CACHE_NAME = 'deeplog-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') || event.request.url.includes('convex.cloud')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-dives') {
    event.waitUntil(syncDives());
  }
});

async function syncDives() {
  const db = await openOfflineDB();
  const tx = db.transaction('pending_dives', 'readonly');
  const store = tx.objectStore('pending_dives');
  const pendingDives = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  for (const dive of pendingDives) {
    try {
      const response = await fetch('/api/dives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dive),
      });
      if (response.ok) {
        const deleteTx = db.transaction('pending_dives', 'readwrite');
        const deleteStore = deleteTx.objectStore('pending_dives');
        deleteStore.delete(dive.id);
      }
    } catch (e) {
      console.error('Failed to sync dive:', e);
    }
  }
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('deeplog-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_dives')) {
        db.createObjectStore('pending_dives', { keyPath: 'id' });
      }
    };
  });
}