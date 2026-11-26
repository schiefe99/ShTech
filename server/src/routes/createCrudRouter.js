import { Router } from 'express'
import { requireAdmin } from '../auth.js'
import { tooLong } from '../security.js'

/**
 * FÁBRICA DE ROTAS — gera as 5 rotas REST para qualquer repositório.
 *
 *   GET    /           → lista (aceita filtros: ?characterId=luma)
 *   GET    /:id        → busca um
 *   POST   /           → cria                       → 201 Created
 *   PATCH  /:id        → atualiza PARCIALMENTE      → 200
 *   DELETE /:id        → apaga                      → 204 No Content
 *
 * PATCH vs PUT: PUT = "substitua o registro inteiro"; PATCH = "mude só
 * estes campos". Nosso update é parcial, então PATCH é o verbo certo.
 *
 * required: campos obrigatórios (validados no POST; no PATCH, só se vierem)
 * rule:     validação extra do recurso (ex.: links seguros) → security.js
 *
 * SEGURANÇA: ler (GET) é público, o site precisa. Gravar (POST, PATCH,
 * DELETE) exige o token do admin → requireAdmin responde 401 sem ele.
 */
export function createCrudRouter(repo, { required = [], rule = () => null } = {}) {
  const router = Router()

  // devolve a mensagem de erro, ou null se estiver tudo certo
  function validate(body, { partial }) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Envie um objeto JSON no corpo'
    for (const campo of required) {
      const veio = campo in body
      if (!veio && partial) continue // PATCH sem esse campo: ok
      const v = body[campo]
      if (v === undefined || v === null || String(v).trim() === '') {
        return `O campo "${campo}" é obrigatório`
      }
    }
    return tooLong(body) ?? rule(body)
  }

  router.get('/', (req, res) => {
    res.json(repo.list(req.query))
  })

  router.get('/:id', (req, res) => {
    const item = repo.get(req.params.id)
    if (!item) return res.status(404).json({ error: 'Não encontrado' })
    res.json(item)
  })

  router.post('/', requireAdmin, (req, res) => {
    const erro = validate(req.body, { partial: false })
    if (erro) return res.status(400).json({ error: erro })
    if (req.body.id && repo.get(req.body.id)) {
      return res.status(409).json({ error: `Já existe um registro com id "${req.body.id}"` })
    }
    res.status(201).json(repo.create(req.body))
  })

  router.patch('/:id', requireAdmin, (req, res) => {
    const erro = validate(req.body, { partial: true })
    if (erro) return res.status(400).json({ error: erro })
    const item = repo.update(req.params.id, req.body)
    if (!item) return res.status(404).json({ error: 'Não encontrado' })
    res.json(item)
  })

  router.delete('/:id', requireAdmin, (req, res) => {
    if (!repo.remove(req.params.id)) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).end()
  })

  return router
}
