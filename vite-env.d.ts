/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string; // e.g. http://localhost:8000/api/v1
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
