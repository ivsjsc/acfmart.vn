// Kill-switch service worker.
// Older builds cached /index.html and kept serving stale bundles. This file is
// intentionally minimal: it clears all caches and unregisters itself.
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url))
      })
  )
})
