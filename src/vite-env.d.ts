/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL?: string
  readonly PUBLIC_ENABLE_DEMO_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
