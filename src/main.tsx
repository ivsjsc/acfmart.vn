import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

const container = document.getElementById("root")
if (!container) {
  throw new Error("Root container #root not found")
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register Service Worker for PWA (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}
