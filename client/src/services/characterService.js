import { charactersSeed } from '../data/characters.seed'

/**
 * CHARACTER SERVICE — a única parte do app que sabe ONDE os dados moram.
 *
 * Hoje: localStorage (fica salvo no navegador).
 * Dia 4: trocamos o corpo das funções por fetch('/api/characters'...)
 *        e NENHUM componente precisa mudar.
 *
 * Por isso tudo é `async`: a API de verdade é assíncrona, então já
 * acostumamos os componentes a esperar (await) desde agora.
 */

const STORAGE_KEY = 'shtech:characters'

// ---------- helpers internos (privados deste arquivo) ----------

function read() {
  const raw = localStorage.getItem(STORAGE_KEY)

  // Primeira visita: ainda não tem nada salvo → grava o seed
  if (!raw) {
    write(charactersSeed)
    return structuredClone(charactersSeed)
  }
  return JSON.parse(raw)
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function sortByOrder(list) {
  return [...list].sort((a, b) => a.order - b.order)
}

// ---------- CRUD público ----------

export const characterService = {
  /** READ (todos) */
  async list() {
    return sortByOrder(read())
  },

  /** READ (um) */
  async get(id) {
    const found = read().find((c) => c.id === id)
    if (!found) throw new Error(`Personagem "${id}" não encontrado`)
    return found
  },

  /** CREATE */
  async create(data) {
    const all = read()
    const novo = {
      lines: [],
      ...data,
      id: crypto.randomUUID(),
      order: all.length + 1,
    }
    write([...all, novo])
    return novo
  },

  /** UPDATE (parcial: só os campos enviados mudam) */
  async update(id, patch) {
    const all = read()
    const index = all.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Personagem "${id}" não encontrado`)

    const atualizado = { ...all[index], ...patch, id } // id nunca muda
    all[index] = atualizado
    write(all)
    return atualizado
  },

  /** DELETE */
  async remove(id) {
    write(read().filter((c) => c.id !== id))
  },

  /** Utilitário de desenvolvimento: volta tudo para o seed */
  async reset() {
    write(charactersSeed)
  },
}
