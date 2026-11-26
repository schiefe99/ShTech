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
  build: {
    // não publica o "mapa" do código-fonte (quem abrisse o DevTools veria tudo)
    sourcemap: false,
    // o Three.js sozinho passa de 500 kb; o aviso padrão não ajuda aqui
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // separa as bibliotecas em arquivos próprios: quando você muda o
        // SEU código, o visitante não precisa baixar o Three.js de novo
        // (o cache do navegador continua valendo para eles)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/three|@react-three|postprocessing|maath|troika/.test(id)) return 'vendor-3d'
          if (/react-router|react-dom|scheduler|\/react\//.test(id)) return 'vendor-react'
        },
      },
    },
  },
})
