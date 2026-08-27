import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        'demo-1': 'demo-1.html',
        'demo-2': 'demo-2.html',
      },
    },
  },
});
