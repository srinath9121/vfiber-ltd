import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        researchPermitting: resolve(__dirname, 'services/research-permitting.html'),
        designDrafting: resolve(__dirname, 'services/design-drafting.html'),
        ospFiber: resolve(__dirname, 'services/osp-fiber.html'),
        poleLoading: resolve(__dirname, 'services/pole-loading-analysis.html')
      }
    }
  }
});

