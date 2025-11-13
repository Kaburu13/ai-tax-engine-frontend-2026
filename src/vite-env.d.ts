
//src/vite-env.d.ts
//<reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;  // e.g. http://127.0.0.1:8000
  readonly VITE_API_VERSION: string;   // e.g. /api/v1
}
interface ImportMeta { readonly env: ImportMetaEnv; }
