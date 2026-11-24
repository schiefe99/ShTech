import { pathToFileURL } from 'node:url'
import { db } from './db.js'
import { characterRepo, demoRepo, planRepo } from './repositories/index.js'

/**
 * SEED — enche o banco com os dados iniciais.
 *
 * Os seeds são OS MESMOS arquivos do front (client/src/data).
 * Uma fonte só da verdade: front e banco começam iguais.
 *
 *   npm run seed   → APAGA tudo e recarrega do zero
 *   (o servidor também roda isso sozinho se o banco estiver vazio)
 */
import { charactersSeed } from '../../client/src/data/characters.seed.js'
import { demosSeed } from '../../client/src/data/demos.seed.js'
import { plansSeed } from '../../client/src/data/plans.seed.js'

export const seed = db.transaction(() => {
  // ordem importa por causa das FOREIGN KEYS: filhos primeiro
  db.exec('DELETE FROM lines; DELETE FROM demos; DELETE FROM characters; DELETE FROM plans;')
  charactersSeed.forEach((c) => characterRepo.create(c)) // personagens antes das demos
  demosSeed.forEach((d) => demoRepo.create(d))
  plansSeed.forEach((p) => planRepo.create(p))
})

export function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM characters').get().n === 0
}

// Rodou "node src/seed.js" direto? Então executa.
// (Se foi importado por outro arquivo, só exporta as funções.)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
  console.log(
    `✓ Banco populado: ${charactersSeed.length} personagens, ${demosSeed.length} demos, ${plansSeed.length} planos`
  )
}
