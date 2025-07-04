/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTEREST_MINER_API_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_FB_ACCESS_TOKEN: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
