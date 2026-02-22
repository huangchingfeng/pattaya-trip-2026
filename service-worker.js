// Pattaya Trip 2026 - Service Worker
// Version: 1.0.0

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAME = `pattaya-2026-${CACHE_VERSION}`;

// 核心頁面
const CORE_PAGES = [
  '/',
  '/index.html',
  '/day.html',
  '/night.html',
  '/itinerary.html',
  '/thai-helper.html',
  '/sop.html',
  '/money.html',
  '/esim.html',
  '/games.html',
  '/truth-or-dare.html',
  '/checklist.html',
  '/souvenirs.html',
  '/resources.html',
  '/offline.html'
];

// JSON 資料檔
const DATA_FILES = [
  '/thai-phrases-complete.json',
  '/thai-advanced-phrases.json'
];

// CDN 資源
const CDN_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];

// 預快取資源清單
const PRE_CACHE_URLS = [...CORE_PAGES, ...DATA_FILES, ...CDN_RESOURCES];

// Install Event: 預快取核心資源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching core resources');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Pre-cache complete');
        return self.skipWaiting(); // 立即啟用新 SW
      })
      .catch((error) => {
        console.error('[SW] Pre-cache failed:', error);
      })
  );
});

// Activate Event: 清理舊快取
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_NAME);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleared');
        return self.clients.claim(); // 立即控制所有頁面
      })
  );
});

// Fetch Event: Network First (fallback to Cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只處理 GET 請求
  if (request.method !== 'GET') return;

  event.respondWith(
    // 策略：Network First
    fetch(request)
      .then((response) => {
        // 成功取得網路回應 → 更新快取
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // 網路失敗 → 嘗試從快取取得
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', request.url);
              return cachedResponse;
            }

            // 快取也沒有 → 返回離線頁面
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            return new Response('Offline - Resource not cached', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Message Event: 處理來自頁面的訊息（未來用於手動更新）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker script loaded:', CACHE_VERSION);
