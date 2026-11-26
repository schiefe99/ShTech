import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import AdminLogin from './AdminLogin'
import { checkSession, logout, LOGOUT_EVENT } from '../../services/auth'
import CharactersAdmin from './CharactersAdmin'
import DemosAdmin from './DemosAdmin'
import PlansAdmin from './PlansAdmin'
import { SITE } from '../../config'

/**
 * ADMIN — /admin/*
 * Rotas ANINHADAS: este componente cuida de tudo que vem depois de /admin
 *   /admin              → redireciona para /admin/personagens
 *   /admin/personagens  → CRUD de personagens
 *   /admin/demos        → CRUD de demos
 *   /admin/planos       → CRUD de planos
 *
 * SENHA: antes de mostrar qualquer coisa, pergunta à API se o token
 * salvo vale (checkSession). Sem login → tela de senha.
 * Atenção: esconder a tela NÃO é a segurança de verdade (qualquer um
 * pode ler o JavaScript do site). Quem protege os dados é a API, que
 * recusa gravar sem token. A tela de login é só a porta de entrada.
 */
const tabs = [
  { to: 'personagens', label: 'Personagens' },
  { to: 'demos', label: 'Demos' },
  { to: 'planos', label: 'Planos' },
]

export default function AdminLayout() {
  // null = conferindo · false = deslogado · true = logado
  // modo 'local' (sem API) não tem servidor para conferir: libera
  const [logado, setLogado] = useState(SITE.dataSource === 'api' ? null : true)

  useEffect(() => {
    if (SITE.dataSource !== 'api') return
    checkSession().then(setLogado)
    // token venceu no meio do uso → volta para o login
    const sair = () => setLogado(false)
    window.addEventListener(LOGOUT_EVENT, sair)
    return () => window.removeEventListener(LOGOUT_EVENT, sair)
  }, [])

  if (logado === null) return <div className="grid min-h-screen place-items-center bg-neutral-950 font-mono text-sm text-neutral-500">Conferindo acesso...</div>
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="flex flex-wrap items-center gap-6 border-b border-white/10 px-6 py-4 md:px-10">
        <span className="text-lg font-medium">
          {SITE.name}® <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">admin</span>
        </span>

        <nav className="flex gap-1">
          {tabs.map((t) => (
            // NavLink sabe se é a rota atual → isActive muda o estilo
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm transition ${isActive ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="ml-auto text-sm text-neutral-400 hover:text-white">Ver site ↗</Link>
        {SITE.dataSource === 'api' && (
          <button onClick={logout} className="text-sm text-neutral-400 hover:text-white">Sair</button>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <Routes>
          <Route index element={<Navigate to="personagens" replace />} />
          <Route path="personagens" element={<CharactersAdmin />} />
          <Route path="demos" element={<DemosAdmin />} />
          <Route path="planos" element={<PlansAdmin />} />
        </Routes>
      </main>
    </div>
  )
}
