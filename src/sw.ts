// Service Worker for ACFMart PWA
// This fixes the registration issue mentioned in requirements

// Define the cache name
const CACHE_NAME = 'acfmart-v1.12';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo1.png',
  '/assets/logo2.png',
];

// Install a service worker
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Installing Service Worker...');
  
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Activating Service Worker...');
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for message events from the client
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications if needed
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Default body',
      icon: data.icon || '/assets/logo1.png',
      badge: '/assets/badge-icon.png',
      data: {
        clickAction: data.clickAction || '/dashboard'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ACFMart Notification', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.clickAction)
  );
});

// Declare the service worker types
declare const self: ServiceWorkerGlobalScope;