import Medusa from "@medusajs/js-sdk"

const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000"

const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ""

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  debug: import.meta.env.DEV,
})

export const REGION_ID = import.meta.env.VITE_MEDUSA_REGION_ID || ""
