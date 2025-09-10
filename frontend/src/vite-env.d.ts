/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTEREST_MINER_API_URL: string
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_FB_APP_SECRET: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
