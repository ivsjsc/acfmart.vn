import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { applyPortalDocumentMetadata } from "./lib/domain"

const container = document.getElementById("root")
if (!container) {
  throw new Error("Root container #root not found")
}

applyPortalDocumentMetadata()

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Do not register a service worker until the app has a cache invalidation
// strategy. Older builds cached /index.html and served stale bundles.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((reg) => reg.unregister()))
      .catch(() => {
        // Ignore: service workers are optional for the storefront.
      })
  })
}
