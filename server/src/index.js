import { config, checkConfig } from './config.js' // 1º: carrega o .env
import express from 'express'
import cors from 'cors'
import { characterRepo, demoRepo, planRepo } from './repositories/index.js'
import { createCrudRouter } from './routes/createCrudRouter.js'
import { seed, seedLayouts, isEmpty } from './seed.js'
import { authRouter, requireAdmin } from './auth.js'
import { securityHeaders, rules } from './security.js'

/**
 * SERVIDOR — o ponto de entrada da API.
 *
 * Caminho de uma requisição:
 *   front (fetch) → segurança (CORS, cabeçalhos) → rota (login? valida)
 *   → repositório (SQL) → SQLite, e a resposta volta em JSON.
 */
checkConfig() // em produção, configuração insegura = não sobe

const app = express()

// não anuncia "X-Powered-By: Express" (menos pista para quem ataca)
app.disable('x-powered-by')

// atrás do proxy do Render/Railway: req.ip passa a ser o IP real do
// visitante (o limite de tentativas de login depende disso)
app.set('trust proxy', 1)

app.use(securityHeaders)

// CORS: só os endereços do front em CORS_ORIGIN podem chamar a API.
// Em dev o Vite usa proxy, mas em produção (Vercel → Render) precisa.
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
)

// transforma o corpo JSON em objeto (req.body); acima de 100 kb é recusado
app.use(express.json({ limit: '100kb' }))

// log simples: mostra cada requisição no terminal
app.use((req, res, next) => {
  const inicio = Date.now()
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio}ms)`))
  next()
})

// ---------- rotas ----------
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)

app.use('/api/characters', createCrudRouter(characterRepo, { required: ['name', 'role', 'eyeColor'], rule: rules.characters }))
app.use('/api/demos', createCrudRouter(demoRepo, { required: ['characterId', 'title'], rule: rules.demos }))
app.use('/api/plans', createCrudRouter(planRepo, { required: ['name', 'type'], rule: rules.plans }))

// volta tudo para o seed: só com login, e em produção só se ALLOW_RESET=true
app.post('/api/reset', requireAdmin, (req, res) => {
  if (config.isProd && !config.allowReset) {
    return res.status(403).json({ error: 'Reset desativado em produção (ALLOW_RESET=true para liberar)' })
  }
  seed()
  res.json({ ok: true })
})

// ---------- erros ----------

// nenhuma rota respondeu
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }))

// qualquer erro lançado nas rotas cai aqui (Express 5 pega até de async)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Conteúdo grande demais' })
  // erros de regra do banco viram 400 com mensagem legível
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ error: 'Referência inválida: o personagem (characterId) não existe' })
  }
  if (err.code?.startsWith('SQLITE_CONSTRAINT')) {
    // em produção não mostra detalhes do banco para o visitante
    return res.status(400).json({ error: config.isProd ? 'Dado inválido' : `Dado inválido: ${err.message}` })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// banco novo? popula com o seed antes de abrir
if (isEmpty()) {
  seed()
  console.log('Banco vazio → seed aplicado')
} else {
  // banco já existe: só sincroniza os layouts (o resto fica como está)
  const { novos, removidos } = seedLayouts()
  if (removidos.length) console.log(`Layouts removidos: ${removidos.join(', ')}`)
  if (novos.length) console.log(`Layouts adicionados: ${novos.join(', ')}`)
}

app.listen(config.port, () => console.log(`API rodando em http://localhost:${config.port}/api`))
