import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind IPv4 explicitly: Vite's default resolves to [::1] on Windows, where
    // loopback connections to the IPv6 address can hang instead of refusing.
    host: '127.0.0.1',
    port: 5173,
    // `npm run dev:api` serves content, uploads and the /aboli API on 8787.
    proxy: {
      '/api': 'http://127.0.0.1:8787',
      '/uploads': 'http://127.0.0.1:8787',
    },
  },
});
