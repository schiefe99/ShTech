import { db } from '../db.js'
import { createRepository } from './createRepository.js'

/**
 * Repositórios de cada tabela.
 * demos e plans são "simples": a fábrica resolve tudo.
 * characters tem um extra: as FALAS ficam em outra tabela (lines).
 */

export const demoRepo = createRepository({
  table: 'demos',
  columns: ['characterId', 'order', 'title', 'niche', 'url', 'thumbnail', 'description', 'features', 'inSubscription', 'accent'],
  json: ['features'],
  bool: ['inSubscription'],
  filterable: ['characterId'],
})

export const planRepo = createRepository({
  table: 'plans',
  columns: ['order', 'type', 'name', 'tagline', 'price', 'pricePrefix', 'period', 'features', 'limits', 'highlight', 'ctaLabel'],
  json: ['features', 'limits'],
  bool: ['highlight'],
  filterable: ['type'],
})

const lineRepo = createRepository({
  table: 'lines',
  columns: ['characterId', 'order', 'type', 'text', 'placeholder', 'ctaLabel', 'ctaHref'],
  filterable: ['characterId'],
})

const baseCharacterRepo = createRepository({
  table: 'characters',
  columns: ['name', 'role', 'bodyColor', 'eyeColor', 'shirtColor', 'order', 'tagline', 'intro', 'benefits', 'process'],
  json: ['benefits', 'process'],
})

// ---------- personagem + falas ----------

// junta as falas no objeto, no mesmo formato do seed do front
const withLines = (c) => c && { ...c, lines: lineRepo.list({ characterId: c.id }) }

/**
 * Troca TODAS as falas de um personagem pela lista recebida.
 * Mais simples que descobrir qual fala mudou, entrou ou saiu.
 */
function replaceLines(characterId, lines = []) {
  db.prepare('DELETE FROM lines WHERE characterId = ?').run(characterId)
  lines.forEach((line, i) => lineRepo.create({ ...line, characterId, order: line.order ?? i + 1 }))
}

/**
 * db.transaction: tudo dentro acontece junto ou NADA acontece.
 * Se a 3ª fala der erro, o personagem e as 2 primeiras falas
 * também são desfeitos (o banco nunca fica "pela metade").
 */
export const characterRepo = {
  list: (filter) => baseCharacterRepo.list(filter).map(withLines),

  get: (id) => withLines(baseCharacterRepo.get(id)),

  create: db.transaction((data) => {
    const { lines, ...dados } = data
    const novo = baseCharacterRepo.create(dados)
    replaceLines(novo.id, lines)
    return withLines(novo)
  }),

  update: db.transaction((id, patch) => {
    const { lines, ...dados } = patch
    const atualizado = baseCharacterRepo.update(id, dados)
    if (!atualizado) return null
    if (lines) replaceLines(id, lines) // só mexe nas falas se vieram no patch
    return withLines(atualizado)
  }),

  remove: (id) => baseCharacterRepo.remove(id), // falas e demos vão junto (CASCADE)
}
