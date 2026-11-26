import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

// lazy: o código do admin e da tela cheia só é baixado quando alguém
// abre essas páginas → o visitante comum carrega um site mais leve
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const LayoutPreview = lazy(() => import('./pages/LayoutPreview'))

/**
 * ROTAS do site:
 *   /              → roda de robôs + conversa
 *   /servico/:id   → a MESMA Home, com a TV do robô ligada (ex.: /servico/luma)
 *   /admin/*       → painel CRUD (personagens, demos, planos)
 *   /layout/:key   → layout de nicho em tela cheia (?nome=&cidade=)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="grid min-h-screen place-items-center font-mono text-sm">Carregando...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/layout/:key" element={<LayoutPreview />} />
          {/* uma rota só para "/" e "/servico/:id": a Home NUNCA é desmontada
              ao abrir a TV (a cena 3D continua viva para a câmera voar) */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
