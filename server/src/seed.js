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

/**
 * SINCRONIZA OS LAYOUTS — deixa o banco com exatamente os layouts de
 * client/src/data/layoutPresets.js, SEM mexer no resto.
 *
 * Diferente do seed() acima, não apaga tudo: suas edições do /admin
 * (preços, textos, outras demos) continuam. É "idempotente": rodar 1 ou
 * 10 vezes dá o mesmo resultado, porque cada layout tem um id fixo
 * (layout-essencial, layout-foto...).
 *
 *   1. remove layouts antigos (layout-* que não existem mais) e a
 *      demo da Mallu, que era um link para o site real
 *   2. cria os layouts que ainda não estão no banco
 *
 * Se você apagar um layout pelo admin, ele volta no próximo start.
 * Para tirar de vez, remova-o de client/src/data/layoutPresets.js.
 */
const REMOVIDAS = ['demo-mallu']

export const seedLayouts = db.transaction(() => {
  const layouts = demosSeed.filter((d) => d.url?.startsWith('/layout/'))
  const ids = new Set(layouts.map((d) => d.id))

  const antigas = db
    .prepare(`SELECT id, title FROM demos WHERE id LIKE 'layout-%' OR id IN (${REMOVIDAS.map(() => '?').join(',')})`)
    .all(...REMOVIDAS)
    .filter((d) => !ids.has(d.id))
  antigas.forEach((d) => demoRepo.remove(d.id))

  const novos = layouts.filter((d) => !demoRepo.get(d.id))
  novos.forEach((d) => demoRepo.create(d))

  return { novos: novos.map((d) => d.title), removidos: antigas.map((d) => d.title) }
})

export function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM characters').get().n === 0
}

// Rodou "node src/seed.js" direto? Então executa.
// (Se foi importado por outro arquivo, só exporta as funções.)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--layouts')) {
    const { novos, removidos } = seedLayouts()
    if (removidos.length) console.log(`✓ Removidos: ${removidos.join(', ')}`)
    console.log(novos.length ? `✓ Layouts adicionados: ${novos.join(', ')}` : '✓ Layouts já estavam no banco')
    process.exit(0)
  }
  seed()
  console.log(
    `✓ Banco populado: ${charactersSeed.length} personagens, ${demosSeed.length} demos, ${plansSeed.length} planos`
  )
}
