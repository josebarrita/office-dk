import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Office DK — versión 2D (Canvas 2D)
export default defineConfig({
  base: '/office-dk/',
  plugins: [react()],
  server: {
    port: 3001,
    open: true
  }
});
