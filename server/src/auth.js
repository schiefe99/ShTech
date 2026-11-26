import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { Router } from 'express'
import { config } from './config.js'

const scryptAsync = promisify(scrypt)

/**
 * AUTENTICAÇÃO DO ADMIN
 *
 * 1. SENHA → nunca guardamos a senha, só o HASH dela (scrypt).
 *    Hash é uma "impressão digital" de mão única: dá para conferir se
 *    a senha digitada bate, mas não dá para voltar do hash para a senha.
 *    O SALT (bytes aleatórios) faz duas senhas iguais virarem hashes
 *    diferentes, e o scrypt é LENTO de propósito: testar milhões de
 *    senhas por força bruta fica caro demais.
 *
 *    Formato guardado:  scrypt$N$r$p$<salt>$<hash>   (base64)
 *
 * 2. TOKEN → depois do login, o servidor entrega um token ASSINADO
 *    (HMAC-SHA256 com o SESSION_SECRET). O front manda esse token em
 *    toda requisição que grava dados:  Authorization: Bearer <token>
 *    Se alguém alterar o token, a assinatura não bate e ele é recusado.
 */

// custo do scrypt: N = 2^15 (~50ms por tentativa, ~32 MB de memória)
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, keylen: 64 }
const scryptOpts = (N, r, p) => ({ N, r, p, maxmem: 128 * N * r * 2 })

/** senha em texto → hash para guardar (usado pelo npm run hash-senha) */
export async function hashPassword(senha) {
  const salt = randomBytes(16)
  const hash = await scryptAsync(senha, salt, SCRYPT.keylen, scryptOpts(SCRYPT.N, SCRYPT.r, SCRYPT.p))
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), hash.toString('base64')].join('$')
}

/** confere a senha digitada com o hash guardado */
export async function verifyPassword(senha, guardado) {
  const [alg, N, r, p, saltB64, hashB64] = String(guardado).split('$')
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false
  const esperado = Buffer.from(hashB64, 'base64')
  const calculado = await scryptAsync(String(senha), Buffer.from(saltB64, 'base64'), esperado.length, scryptOpts(+N, +r, +p))
  // timingSafeEqual: compara SEMPRE no mesmo tempo (não vaza "quantas letras acertou")
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}

// ---------- token assinado ----------

const b64url = (buf) => Buffer.from(buf).toString('base64url')
const sign = (data) => createHmac('sha256', config.sessionSecret).update(data).digest('base64url')

export function createToken() {
  const payload = b64url(JSON.stringify({ sub: 'admin', exp: Date.now() + config.sessionHours * 3600_000 }))
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token) {
  if (!token || !config.sessionSecret) return false
  const [payload, assinatura] = String(token).split('.')
  if (!payload || !assinatura) return false
  const a = Buffer.from(assinatura)
  const b = Buffer.from(sign(payload))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return sub === 'admin' && Date.now() < exp
  } catch {
    return false
  }
}

/** middleware: só deixa passar quem mandou um token válido */
export function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (verifyToken(token)) return next()
  res.status(401).json({ error: 'Faça login no admin para continuar' })
}

// ---------- limite de tentativas (contra força bruta) ----------

/**
 * Guarda, por IP, quantas vezes a senha foi errada. Depois de MAX erros
 * em JANELA minutos, o IP fica bloqueado até a janela passar.
 * Fica na memória: reiniciar o servidor zera (suficiente para 1 admin).
 */
const MAX_ERROS = 5
const JANELA_MS = 15 * 60_000
const tentativas = new Map() // ip → { erros, desde }

function bloqueado(ip) {
  const t = tentativas.get(ip)
  if (!t) return 0
  if (Date.now() - t.desde > JANELA_MS) {
    tentativas.delete(ip)
    return 0
  }
  return t.erros >= MAX_ERROS ? Math.ceil((t.desde + JANELA_MS - Date.now()) / 60_000) : 0
}

function registraErro(ip) {
  const t = tentativas.get(ip) ?? { erros: 0, desde: Date.now() }
  t.erros += 1
  tentativas.set(ip, t)
}

// ---------- rotas /api/auth ----------

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const ip = req.ip
  const minutos = bloqueado(ip)
  if (minutos) {
    res.set('Retry-After', String(minutos * 60))
    return res.status(429).json({ error: `Muitas tentativas. Tente de novo em ${minutos} min.` })
  }

  if (!config.adminPasswordHash || !config.sessionSecret) {
    return res.status(503).json({ error: 'Login desativado: configure ADMIN_PASSWORD_HASH e SESSION_SECRET' })
  }

  const senha = req.body?.password
  if (typeof senha !== 'string' || senha.length === 0 || senha.length > 200) {
    return res.status(400).json({ error: 'Informe a senha' })
  }

  if (!(await verifyPassword(senha, config.adminPasswordHash))) {
    registraErro(ip)
    // mensagem genérica de propósito: não dá pistas para quem está chutando
    return res.status(401).json({ error: 'Senha incorreta' })
  }

  tentativas.delete(ip)
  res.json({ token: createToken(), expiresInHours: config.sessionHours })
})

// o front usa para saber se o token salvo ainda vale
authRouter.get('/me', requireAdmin, (req, res) => res.json({ ok: true }))
