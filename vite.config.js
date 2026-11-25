import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Solo actúa con VITE_API_BASE_URL vacío (rutas relativas): master local no tiene CORS (DF-022).
    proxy: {
      // El feed en vivo (DF-047) va primero: con `npm run dev:feed` apunta al servidor SSE de prueba (:3002);
      // sin eso, a master local como el resto de /api.
      '/api/feed': process.env.FEED_PROXY_TARGET || 'http://localhost:3001',
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
})
