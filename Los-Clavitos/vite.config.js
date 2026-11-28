import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para pruebas locales: conectar React (5173) al túnel SSH de AWS (8081).
  server: {
    proxy: {
      "/api": {
        target: process.env.FERRETERIA_API_PROXY || "http://127.0.0.1:8081",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/components/**', 'src/services/**'],
    },
  },
})