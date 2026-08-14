import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) return 'vendor-jspdf';
            if (id.includes('jszip')) return 'vendor-jszip';
            if (id.includes('tesseract.js')) return 'vendor-tesseract';
            if (id.includes('@huggingface/transformers') || id.includes('onnxruntime') || id.includes('emnapi')) {
              return 'vendor-transformers';
            }
            if (
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('lucide-react')
            ) {
              return 'vendor-core';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200
  }
})
