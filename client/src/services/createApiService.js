/**
 * FÁBRICA DE SERVICES DA API — MESMA interface do createLocalService:
 *   list(filter) · get(id) · create(data) · update(id, patch) · remove(id) · reset()
 * Por isso os hooks e componentes nem percebem a troca.
 *
 * Em dev, "/api" é redirecionado pelo Vite para http://localhost:3001
 * (proxy no vite.config.js). Em produção, defina VITE_API_URL com o
 * endereço da API (ex.: https://shtech-api.onrender.com/api).
 */
const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // fetch só "falha" quando nem chegou no servidor (desligado, sem rede)
    throw new Error('Não foi possível conectar à API. O servidor está rodando? (cd server → npm run dev)')
  }

  if (res.status === 204) return null // DELETE não devolve corpo

  const data = await res.json().catch(() => null)
  // erro HTTP (400, 404, 500...): usa a mensagem que a API mandou
  if (!res.ok) throw new Error(data?.error ?? `Erro ${res.status}`)
  return data
}

export function createApiService({ key }) {
  const url = (id = '') => `/${key}${id ? '/' + encodeURIComponent(id) : ''}`

  return {
    // { characterId: 'luma' } → /demos?characterId=luma
    list: (filter = {}) => {
      const query = new URLSearchParams(filter).toString()
      return request(url() + (query ? `?${query}` : ''))
    },
    get: (id) => request(url(id)),
    create: (data) => request(url(), { method: 'POST', body: JSON.stringify(data) }),
    update: (id, patch) => request(url(id), { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id) => request(url(id), { method: 'DELETE' }),
    reset: () => request('/reset', { method: 'POST' }),
  }
}
