import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite = servidor de desenvolvimento + build.
// Os plugins ensinam o Vite a entender JSX (react) e Tailwind v4.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // PROXY: o front chama "/api/..." e o Vite repassa para o Express.
    // Para o navegador é tudo o mesmo endereço → sem problema de CORS.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
