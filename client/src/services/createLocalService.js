import { sortByOrder } from '../utils/helpers'

/**
 * FÁBRICA DE SERVICES — cria um CRUD completo para QUALQUER coleção.
 *
 *   const demoService = createLocalService({ key: 'demos', seed: demosSeed })
 *   await demoService.list({ characterId: 'luma' })
 *
 * Por que uma fábrica? Personagens, demos e planos precisam do MESMO
 * CRUD. Em vez de copiar e colar 3 vezes (e corrigir bug em 3 lugares),
 * escrevemos uma vez e "fabricamos" um service para cada coleção.
 *
 * Hoje os dados vivem no localStorage. No Dia 4 criamos um
 * `createApiService` com a MESMA interface usando fetch — e os
 * componentes nem percebem a troca.
 *
 * `version`: quando você muda o seed (ex.: adiciona um campo novo),
 * aumente a versão → a chave muda → o seed novo é carregado sozinho.
 * Acabou o `localStorage.removeItem` manual!
 */
export function createLocalService({ key, seed, version = 1 }) {
  const STORAGE_KEY = `shtech:${key}:v${version}`

  function read() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      write(seed) // primeira visita (ou versão nova): grava o seed
      return structuredClone(seed)
    }
    return JSON.parse(raw)
  }

  function write(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // { characterId: 'luma' } → só itens em que TODOS os campos batem
  function matches(item, filter) {
    return Object.entries(filter).every(([field, value]) => item[field] === value)
  }

  return {
    /** READ (todos, com filtro opcional) */
    async list(filter = {}) {
      return sortByOrder(read().filter((item) => matches(item, filter)))
    },

    /** READ (um) */
    async get(id) {
      const found = read().find((item) => item.id === id)
      if (!found) throw new Error(`${key}: "${id}" não encontrado`)
      return found
    },

    /** CREATE */
    async create(data) {
      const all = read()
      // aceita id "bonito" (ex.: 'luma') ou gera um, igual à API
      const novo = { order: all.length + 1, ...data, id: data.id || crypto.randomUUID() }
      write([...all, novo])
      return novo
    },

    /** UPDATE (parcial: só os campos enviados mudam) */
    async update(id, patch) {
      const all = read()
      const index = all.findIndex((item) => item.id === id)
      if (index === -1) throw new Error(`${key}: "${id}" não encontrado`)
      all[index] = { ...all[index], ...patch, id } // id nunca muda
      write(all)
      return all[index]
    },

    /** DELETE */
    async remove(id) {
      write(read().filter((item) => item.id !== id))
    },

    /** Desenvolvimento: volta tudo para o seed */
    async reset() {
      write(seed)
    },
  }
}
