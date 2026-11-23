import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite = servidor de desenvolvimento + build.
// Os plugins ensinam o Vite a entender JSX (react) e Tailwind v4.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No Dia 4 vamos adicionar aqui um "proxy" para /api → servidor Express
})
