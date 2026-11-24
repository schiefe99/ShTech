/**
 * Funções pequenas e "puras" (mesma entrada → mesma saída, sem efeitos).
 * Ficam aqui para serem reutilizadas e fáceis de testar.
 */

/**
 * Resto da divisão que funciona com negativos.
 *   -1 % 4      → -1   (JS puro, ruim para índice de array)
 *   mod(-1, 4)  →  3   (o que queremos: "voltar" para o último)
 */
export const mod = (n, m) => ((n % m) + m) % m

/**
 * Troca {chaves} no texto pelos valores do objeto.
 *   interpolate('Oi, {name}!', { name: 'Ana' }) → 'Oi, Ana!'
 * Chave sem valor vira string vazia.
 */
export const interpolate = (text = '', values = {}) =>
  text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')

/**
 * Ordena qualquer lista pelo campo `order` sem alterar a original.
 */
export const sortByOrder = (list = []) => [...list].sort((a, b) => a.order - b.order)
