import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('svgArt.js')) return 'svg-art';
        },
      },
    },
  },
});
