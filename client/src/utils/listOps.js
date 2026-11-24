/**
 * Operações em listas SEM alterar a original (o React precisa de uma
 * lista NOVA para perceber a mudança e redesenhar).
 */

/** troca campos do item i: updateAt(falas, 1, { text: 'Oi' }) */
export const updateAt = (list, i, patch) =>
  list.map((item, j) => (j === i ? (typeof item === 'object' ? { ...item, ...patch } : patch) : item))

/** remove o item i */
export const removeAt = (list, i) => list.filter((_, j) => j !== i)

/** move o item i para cima (dir = -1) ou para baixo (dir = 1) */
export function move(list, i, dir) {
  const j = i + dir
  if (j < 0 || j >= list.length) return list
  const copia = [...list]
  ;[copia[i], copia[j]] = [copia[j], copia[i]] // troca os dois de lugar
  return copia
}

/** 'Ana Lúcia!' → 'ana-lucia' (para ids que aparecem na URL) */
export const slugify = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // tudo que não é letra/número vira "-"
    .replace(/^-+|-+$/g, '') // tira "-" das pontas
