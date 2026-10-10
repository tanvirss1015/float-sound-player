import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Only the separate, static Android bundle uses this configuration.
// The Lovable website retains its TanStack Start build and SSR entry.
export default defineConfig({
  root: 'android-web',
  publicDir: '../public',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { outDir: '../dist/android', emptyOutDir: true },
});