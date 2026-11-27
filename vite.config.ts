import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repository beneath /Alfa-and-Kitty/.
  base: '/Alfa-and-Kitty/',
  server: { host: '0.0.0.0' },
  build: { target: 'es2022', sourcemap: true }
});
