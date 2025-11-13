// // vite.config.ts
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'), // ESM-safe __dirname
//     },
//   },
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': { target: 'http://localhost:8000', changeOrigin: true },
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true,
//   },
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { proxy: { '/api': 'http://localhost:8000' } },
});
