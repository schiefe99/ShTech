/**
 * LOGIN DO ADMIN (lado do navegador)
 *
 * A senha vai UMA vez para a API (POST /api/auth/login), que devolve um
 * token assinado. O token fica no sessionStorage: some quando a aba
 * fecha, e a senha nunca fica guardada no navegador.
 *
 * O token NÃO é a senha e expira sozinho (8h por padrão). Quem decide
 * se ele vale é sempre o servidor; o front só o guarda e o envia.
 */
const KEY = 'shtech:admin-token'
const BASE = import.meta.env.VITE_API_URL ?? '/api'

// evento que avisa o admin "o login caiu" (token expirou ou foi recusado)
export const LOGOUT_EVENT = 'shtech:logout'

export function getToken() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

function setToken(token) {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* navegador sem armazenamento: o login dura só até recarregar */
  }
}

export async function login(password) {
  let res
  try {
    res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  } catch {
    throw new Error('Não foi possível conectar à API.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? `Erro ${res.status}`)
  setToken(data.token)
}

export function logout() {
  setToken(null)
  window.dispatchEvent(new Event(LOGOUT_EVENT))
}

/** pergunta à API se o token salvo ainda vale */
export async function checkSession() {
  const token = getToken()
  if (!token) return false
  try {
    const res = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) return true
  } catch {
    return false // API fora do ar: trata como deslogado
  }
  setToken(null)
  return false
}
