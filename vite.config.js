import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  appType: 'spa',
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/';

          if (req.method !== 'GET') return next();
          if (url.startsWith('/@') || url.startsWith('/src') || url.startsWith('/node_modules') || url.includes('.')) {
            return next();
          }

          if (url === '/' || url.startsWith('/login') || url.startsWith('/onboarding') || url.startsWith('/dashboard') || url.startsWith('/create') || url.startsWith('/brand') || url.startsWith('/designs') || url.startsWith('/styleguide')) {
            req.url = '/index.html';
          }

          next();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
