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
  },
  build: {
    rollupOptions: {
      output: {
        // three.js is only needed for the hero field; keeping it in its own
        // chunk lets the rest of the page paint without waiting on it.
        manualChunks: { three: ['three'] },
      },
    },
  },
});
