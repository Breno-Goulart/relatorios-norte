import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Bundle React dependencies together
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Bundle Firebase separately
          'vendor-firebase': ['firebase'],
          // Bundle icon library separately
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});