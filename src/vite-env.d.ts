/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDUSA_BACKEND_URL: string
  readonly VITE_MEDUSA_PUBLISHABLE_KEY: string
  readonly VITE_MEDUSA_REGION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
