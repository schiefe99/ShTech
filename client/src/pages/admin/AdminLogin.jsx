import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../../services/auth'
import { SITE } from '../../config'
import { Button, Field, TextInput } from '../../components/admin/ui'

/**
 * Tela de login do admin. A senha vai direto para a API, que confere
 * com o hash; aqui no front não existe senha nenhuma para comparar.
 */
export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(password)
      setPassword('') // não deixa a senha parada na memória da tela
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div>
          <span className="text-lg font-medium">
            {SITE.name}® <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">admin</span>
          </span>
          <p className="mt-2 text-sm text-neutral-400">Área restrita. Entre com a senha do admin.</p>
        </div>

        <Field label="Senha">
          <TextInput
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            autoFocus
            required
          />
        </Field>

        {error && <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={loading || !password} className="w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Link to="/" className="block text-center text-sm text-neutral-500 hover:text-white">← Voltar ao site</Link>
      </form>
    </div>
  )
}
