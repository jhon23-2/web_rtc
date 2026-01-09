import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['simple-peer'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    commonjsOptions: {
      include: [/simple-peer/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})