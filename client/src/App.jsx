import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ServicePage from './pages/ServicePage'

/**
 * ROTAS do site:
 *   /              → roda de robôs + conversa
 *   /servico/:id   → página do serviço (":id" = id do personagem, ex.: luma)
 *   /admin         → (Dia 4) painel CRUD
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servico/:id" element={<ServicePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
