import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // This is the default output directory for Vite. Adjust if necessary.
    assetsDir: 'assets', // This is the default assets directory for Vite. Adjust if necessary.
    rollupOptions: {
      input: 'public/index.html', // Specify the entry point for your application.
    },
  },
  server: {
    proxy: {
      '/notes': {
        target: 'http://backend:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
