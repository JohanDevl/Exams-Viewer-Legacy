// Service Worker for Intelligent Caching with Background Updates
const CACHE_NAME = 'exams-viewer-v1';
const CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours in milliseconds (reduced for better freshness)

// Files to cache immediately
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css',
  '/favicon.ico',
  '/favicon.svg',
  'data/manifest.json'
];

// Cache strategy configuration
const CACHE_STRATEGIES = {
  examData: 'cache-first-with-background-update',
  chunks: 'cache-first-with-background-update', 
  manifest: 'network-first',
  static: 'cache-first'
};

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static files');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Determine cache strategy based on URL
  let strategy = CACHE_STRATEGIES.static;
  
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    if (url.pathname.includes('manifest.json')) {
      strategy = CACHE_STRATEGIES.manifest;
    } else if (url.pathname.includes('/chunks/chunk_')) {
      strategy = CACHE_STRATEGIES.chunks;
    } else {
      strategy = CACHE_STRATEGIES.examData;
    }
  }

  event.respondWith(handleRequest(event.request, strategy));
});

// Main request handler
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cache-first-with-background-update':
      return await cacheFirstWithBackgroundUpdate(request);
    case 'network-first':
      return await networkFirst(request);
    default:
      return await cacheFirst(request);
  }
}

// Cache-first strategy with background update
async function cacheFirstWithBackgroundUpdate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is expired
    const cacheTime = await getCacheTimestamp(request.url);
    const isExpired = cacheTime && (Date.now() - cacheTime) > CACHE_EXPIRY;

    if (!isExpired) {
      // Return cached version and schedule background update
      scheduleBackgroundUpdate(request, cache);
      return cachedResponse;
    }
  }

  // No cache or expired - fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await updateCache(cache, request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed, return stale cache if available
    if (cachedResponse) {
      console.log('Network failed, returning stale cache for:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy (for manifest)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await updateCache(cache, request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Simple cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    await updateCache(cache, request, networkResponse.clone());
  }
  return networkResponse;
}

// Update cache with timestamp
async function updateCache(cache, request, response) {
  await cache.put(request, response);
  await setCacheTimestamp(request.url, Date.now());
}

// Background update scheduler
function scheduleBackgroundUpdate(request, cache) {
  // Use scheduler API if available for better performance, otherwise fallback to setTimeout
  const scheduleBackgroundUpdate = async () => {
    try {
      console.log('Background updating:', request.url);
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await updateCache(cache, request, networkResponse);
        
        // Throttle notifications to avoid overwhelming main thread
        const lastNotification = self.lastNotificationTime || 0;
        const now = Date.now();
        if (now - lastNotification > 1000) { // Max 1 notification per second
          self.lastNotificationTime = now;
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_UPDATED',
              url: request.url
            });
          });
        }
      }
    } catch (error) {
      console.log('Background update failed for:', request.url, error);
    }
  };

  if ('scheduler' in self && 'postTask' in self.scheduler) {
    self.scheduler.postTask(scheduleBackgroundUpdate, { priority: 'background' });
  } else {
    setTimeout(scheduleBackgroundUpdate, 1000);
  }
}

// Cache timestamp management
async function setCacheTimestamp(url, timestamp) {
  const cache = await caches.open(CACHE_NAME + '-timestamps');
  const response = new Response(timestamp.toString());
  await cache.put(url, response);
}

async function getCacheTimestamp(url) {
  try {
    const cache = await caches.open(CACHE_NAME + '-timestamps');
    const response = await cache.match(url);
    if (response) {
      const timestamp = await response.text();
      return parseInt(timestamp);
    }
  } catch (error) {
    console.log('Error getting cache timestamp:', error);
  }
  return null;
}

// Preload popular exams
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PRELOAD_EXAMS') {
    preloadPopularExams(event.data.exams);
  }
});

async function preloadPopularExams(exams) {
  console.log('Preloading popular exams:', exams);
  const cache = await caches.open(CACHE_NAME);
  
  for (const examCode of exams.slice(0, 5)) { // Limit to top 5
    try {
      const url = `data/${examCode}/exam.json`;
      const cachedResponse = await cache.match(url);
      
      if (!cachedResponse) {
        console.log('Preloading exam:', examCode);
        const response = await fetch(url);
        if (response.ok) {
          await updateCache(cache, new Request(url), response);
        }
      }
    } catch (error) {
      console.log('Failed to preload exam:', examCode, error);
    }
  }
}