/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZALO_ACCESS_TOKEN: string;
  readonly VITE_ZALO_OA_ID: string;
  readonly VITE_MODERATORS_LIST: string;
  readonly VITE_APP_TITLE: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}