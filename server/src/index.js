import express from 'express'
import cors from 'cors'
import { characterRepo, demoRepo, planRepo } from './repositories/index.js'
import { createCrudRouter } from './routes/createCrudRouter.js'
import { seed, isEmpty } from './seed.js'

/**
 * SERVIDOR — o ponto de entrada da API.
 *
 * Caminho de uma requisição:
 *   front (fetch) → rota (valida) → repositório (SQL) → SQLite
 *   e a resposta volta em JSON pelo mesmo caminho.
 */
const app = express()
const PORT = process.env.PORT ?? 3001

// CORS: autoriza o front (em outro endereço) a chamar a API.
// Em dev o Vite usa proxy, mas em produção (Vercel → Render) precisa.
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))

// transforma o corpo JSON da requisição em objeto (req.body)
app.use(express.json())

// log simples: mostra cada requisição no terminal
app.use((req, res, next) => {
  const inicio = Date.now()
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio}ms)`))
  next()
})

// ---------- rotas ----------
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/characters', createCrudRouter(characterRepo, { required: ['name', 'role', 'eyeColor'] }))
app.use('/api/demos', createCrudRouter(demoRepo, { required: ['characterId', 'title'] }))
app.use('/api/plans', createCrudRouter(planRepo, { required: ['name', 'type'] }))

// volta tudo para o seed (útil no admin; desligar em produção)
app.post('/api/reset', (req, res) => {
  seed()
  res.json({ ok: true })
})

// ---------- erros ----------

// nenhuma rota respondeu
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }))

// qualquer erro lançado nas rotas cai aqui (Express 5 pega até de async)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  // erros de regra do banco viram 400 com mensagem legível
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ error: 'Referência inválida: o personagem (characterId) não existe' })
  }
  if (err.code?.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ error: `Dado inválido: ${err.message}` })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// banco novo? popula com o seed antes de abrir
if (isEmpty()) {
  seed()
  console.log('Banco vazio → seed aplicado')
}

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}/api`))
