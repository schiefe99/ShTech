#!/usr/bin/env node
/**
 * VERIFICAÇÃO DE SEGURANÇA — SHTECH
 *
 * Rode na raiz do projeto, ANTES de cada deploy:
 *
 *   node tools/security-check.mjs                         → confere o código
 *   node tools/security-check.mjs --live http://localhost:3001
 *                                                         → + testa a API rodando
 *   node tools/security-check.mjs --live https://shtech-api.onrender.com
 *                                                         → + testa a API em produção
 *
 * Resultado:  ✔ ok   ⚠ atenção (não trava)   ✖ falha (precisa corrigir)
 * Sai com código 1 se houver falha → dá para usar em CI (GitHub Actions).
 *
 * Não precisa instalar nada: só Node 18+ (e git/npm, se tiver).
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const LIVE = args.includes('--live') ? args[args.indexOf('--live') + 1] : null

// ---------- saída ----------
const cor = (c, s) => (process.stdout.isTTY ? `\x1b[${c}m${s}\x1b[0m` : s)
const resultado = { ok: 0, warn: 0, fail: 0 }
const ok = (msg) => (resultado.ok++, console.log(`  ${cor(32, '✔')} ${msg}`))
const warn = (msg, dica) => (resultado.warn++, console.log(`  ${cor(33, '⚠')} ${msg}${dica ? cor(90, `\n      → ${dica}`) : ''}`))
const fail = (msg, dica) => (resultado.fail++, console.log(`  ${cor(31, '✖')} ${msg}${dica ? cor(90, `\n      → ${dica}`) : ''}`))
const secao = (t) => console.log(`\n${cor(1, t)}`)

// ---------- utilitários ----------
const ler = (rel) => (existsSync(path.join(ROOT, rel)) ? readFileSync(path.join(ROOT, rel), 'utf8') : null)
const sh = (cmd, cwd = ROOT) => {
  try {
    return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 120_000 })
  } catch (e) {
    return e.stdout ?? null // npm audit sai com código ≠ 0 quando acha algo
  }
}

/** arquivos do projeto (pelo git, se houver; senão varrendo as pastas) */
function arquivosDoProjeto() {
  const git = sh('git ls-files --cached --others --exclude-standard')
  if (git) return git.split('\n').filter(Boolean)
  const lista = []
  const pular = new Set(['node_modules', '.git', 'dist'])
  ;(function andar(dir) {
    for (const nome of readdirSync(path.join(ROOT, dir))) {
      if (pular.has(nome)) continue
      const rel = path.join(dir, nome)
      statSync(path.join(ROOT, rel)).isDirectory() ? andar(rel) : lista.push(rel.split(path.sep).join('/'))
    }
  })('')
  return lista
}

/** lê o server/.env sem executar nada (formato CHAVE=valor) */
function lerEnv(rel) {
  const texto = ler(rel)
  if (texto === null) return null
  const env = {}
  for (const linha of texto.split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha)
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

console.log(cor(1, '\n🔒 Verificação de segurança — SHTECH'))
console.log(cor(90, `   ${ROOT}`))

const arquivos = arquivosDoProjeto()
const codigo = arquivos.filter((f) => /\.(m?js|jsx|ts|tsx|json|html|sql|py|md|ya?ml|css)$/.test(f) && !f.endsWith('package-lock.json'))

// =====================================================================
secao('1. Arquivos que NÃO podem ir para o GitHub')
// =====================================================================
const gitignore = ler('.gitignore') ?? ''
for (const padrao of ['.env', 'node_modules', '*.db', 'dist']) {
  gitignore.split(/\r?\n/).some((l) => l.trim() === padrao || l.trim() === padrao + '/')
    ? ok(`.gitignore ignora ${padrao}`)
    : fail(`.gitignore não ignora ${padrao}`, `adicione a linha "${padrao}" no .gitignore`)
}

const rastreados = sh('git ls-files') // só o que está COMMITADO/adicionado
if (rastreados === null) {
  warn('git não encontrado: pulei a conferência do que já foi commitado')
} else {
  const perigosos = rastreados.split('\n').filter((f) => /(^|\/)\.env$|\.db(-wal|-shm)?$|\.sqlite$|\.pem$|\.key$/.test(f))
  perigosos.length
    ? fail(`Arquivos sensíveis já estão no git: ${perigosos.join(', ')}`, `git rm --cached <arquivo>  e faça um novo commit`)
    : ok('Nenhum .env, banco ou chave rastreado pelo git')

  const historico = sh('git log --all --format= --name-only') ?? ''
  const vazou = [...new Set(historico.split('\n').filter((f) => /(^|\/)\.env$/.test(f)))]
  vazou.length
    ? fail(`Um .env já foi commitado no passado (${vazou.join(', ')})`, 'troque a senha (npm run hash-senha) e o SESSION_SECRET: o histórico guarda os valores antigos')
    : ok('Nenhum .env no histórico do git')
}

// =====================================================================
secao('2. Segredos escritos no código')
// =====================================================================
const env = lerEnv('server/.env') ?? {}
const valoresSecretos = [env.SESSION_SECRET, env.ADMIN_PASSWORD_HASH].filter((v) => v && v.length >= 16)

const PADROES = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'chave privada'],
  [/AKIA[0-9A-Z]{16}/, 'chave da AWS'],
  [/ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}/, 'token do GitHub'],
  [/sk-[A-Za-z0-9_-]{32,}/, 'chave de API (sk-...)'],
  [/scrypt\$\d+\$\d+\$\d+\$/, 'hash de senha (deve ficar só no .env)'],
  [/(password|senha|passwd|secret|api[_-]?key)\s*[:=]\s*['"][^'"\s]{6,}['"]/i, 'senha/segredo em texto'],
]
let achados = 0
for (const f of codigo) {
  if (f === 'tools/security-check.mjs' || f.endsWith('.env.example')) continue
  const texto = ler(f)
  if (!texto) continue
  for (const [re, nome] of PADROES) {
    const m = re.exec(texto)
    if (m) {
      const linha = texto.slice(0, m.index).split('\n').length
      fail(`${nome} em ${f}:${linha}`, 'mova para uma variável de ambiente (server/.env)')
      achados++
    }
  }
  for (const v of valoresSecretos) {
    if (texto.includes(v)) {
      fail(`Valor do server/.env copiado dentro de ${f}`, 'apague do arquivo; o valor só pode existir no .env')
      achados++
    }
  }
}
if (!achados) ok(`Nenhum segredo encontrado em ${codigo.length} arquivos`)

for (const f of arquivos.filter((f) => /^client\/\.env/.test(f) && !f.endsWith('.example'))) {
  const vars = Object.keys(lerEnv(f) ?? {})
  const ruins = vars.filter((k) => /SECRET|PASSWORD|SENHA|TOKEN|PRIVATE|HASH/.test(k))
  ruins.length
    ? fail(`${f} tem ${ruins.join(', ')}`, 'tudo que começa com VITE_ vai PÚBLICO para o navegador. Segredo só no server')
    : ok(`${f} sem segredos (variáveis VITE_ são públicas)`)
}

// =====================================================================
secao('3. Senha do admin (server/.env)')
// =====================================================================
if (!existsSync(path.join(ROOT, 'server/.env'))) {
  warn('server/.env não existe neste computador', 'rode: cd server && npm run hash-senha')
} else {
  const [alg, N] = (env.ADMIN_PASSWORD_HASH ?? '').split('$')
  alg === 'scrypt' ? ok('ADMIN_PASSWORD_HASH é um hash scrypt (a senha não está salva)') : fail('ADMIN_PASSWORD_HASH ausente ou não é hash', 'rode: cd server && npm run hash-senha')
  if (alg === 'scrypt') Number(N) >= 2 ** 14 ? ok(`Custo do scrypt N=${N} (≥ 16384)`) : warn(`Custo do scrypt baixo (N=${N})`, 'gere o hash de novo com npm run hash-senha')
  ;(env.SESSION_SECRET ?? '').length >= 32 ? ok('SESSION_SECRET com 32+ caracteres') : fail('SESSION_SECRET ausente ou curto', 'apague a linha e rode npm run hash-senha (ele cria um novo)')
  for (const k of Object.keys(env)) {
    if (/^(ADMIN_)?(PASSWORD|SENHA)$/.test(k)) fail(`server/.env tem a senha em texto (${k})`, 'apague essa linha: só o HASH pode ficar salvo')
  }
}

// =====================================================================
secao('4. API (server/src)')
// =====================================================================
const idx = ler('server/src/index.js') ?? ''
const crud = ler('server/src/routes/createCrudRouter.js') ?? ''
const auth = ler('server/src/auth.js') ?? ''

const checar = (cond, bom, ruim, dica) => (cond ? ok(bom) : fail(ruim, dica))
for (const verbo of ['post', 'patch', 'delete']) {
  checar(new RegExp(`router\\.${verbo}\\([^)]*requireAdmin`).test(crud), `${verbo.toUpperCase()} exige login (requireAdmin)`, `${verbo.toUpperCase()} sem requireAdmin no createCrudRouter`, 'qualquer pessoa poderia alterar os dados')
}
checar(/\/api\/reset['"],\s*requireAdmin/.test(idx), '/api/reset exige login', '/api/reset sem requireAdmin', 'qualquer pessoa poderia apagar o banco')
checar(/timingSafeEqual/.test(auth) && /scrypt/.test(auth), 'Senha conferida com scrypt + comparação em tempo constante', 'auth.js sem scrypt/timingSafeEqual')
checar(/MAX_ERROS|429/.test(auth), 'Limite de tentativas de login (anti força bruta)', 'Login sem limite de tentativas')
checar(/disable\(['"]x-powered-by['"]\)/.test(idx), 'X-Powered-By desligado', 'X-Powered-By ligado', "app.disable('x-powered-by')")
checar(/express\.json\(\{\s*limit/.test(idx), 'Tamanho do corpo JSON limitado', 'express.json sem limit', "express.json({ limit: '100kb' })")
checar(/securityHeaders/.test(idx), 'Cabeçalhos de segurança na API', 'API sem cabeçalhos de segurança')
checar(/checkConfig\(\)/.test(idx), 'Produção não sobe com configuração insegura (checkConfig)', 'Sem checkConfig() no início do servidor')
checar(!/cors\(\s*\)/.test(idx) && !/origin:\s*['"]\*['"]/.test(idx), 'CORS restrito a CORS_ORIGIN', 'CORS liberado para qualquer site', 'use cors({ origin: config.corsOrigins })')
checar(/isSafeUrl/.test(ler('server/src/security.js') ?? ''), 'Links (url, ctaHref) validados contra javascript:', 'Links do banco sem validação')
const sqlColado = (ler('server/src/repositories/createRepository.js') ?? '').match(/prepare\(`[^`]*\$\{(?!table|where|allColumns|columns)[^}]+\}/g)
sqlColado ? warn(`Interpolação suspeita em SQL: ${sqlColado[0].slice(0, 60)}...`, 'valores sempre por parâmetro (@campo)') : ok('SQL só com parâmetros (sem valores colados na string)')

// =====================================================================
secao('5. Front-end (client)')
// =====================================================================
const front = codigo.filter((f) => f.startsWith('client/src/') && /\.(jsx?|tsx?)$/.test(f))
let perigoFront = 0
for (const f of front) {
  const t = ler(f) ?? ''
  if (/dangerouslySetInnerHTML|\beval\(|new Function\(|\.innerHTML\s*=/.test(t)) {
    perigoFront++
    fail(`HTML/código dinâmico em ${f}`, 'evite: abre espaço para XSS (injeção de script)')
  }
  for (const m of t.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*(noreferrer|noopener)/.test(m[0])) {
      perigoFront++
      warn(`Link target="_blank" sem rel="noreferrer" em ${f}`)
    }
  }
}
if (!perigoFront) ok(`Sem innerHTML/eval e links externos com rel="noreferrer" (${front.length} arquivos)`)

const renderLanding = ler('client/src/utils/renderLanding.js') ?? ''
checar(/esc\(/.test(renderLanding), 'Texto do visitante escapado antes de entrar nos layouts (esc)', 'renderLanding sem esc()', 'XSS: alguém digitando <script> no nome')

const cfg = ler('client/src/config.js') ?? ''
if (/dataSource:\s*'api'/.test(cfg)) ok("dataSource: 'api'")
else warn("dataSource não é 'api'", 'em modo local o admin não tem senha (os dados ficam só no navegador)')
if (/SEUNUMERO/.test(cfg)) warn('WhatsApp ainda é o placeholder 55SEUNUMERO')
else ok('Número do WhatsApp configurado')

const auth_front = ler('client/src/services/auth.js') ?? ''
checar(/sessionStorage/.test(auth_front) && !/localStorage\.setItem\([^)]*token/i.test(auth_front), 'Token do admin no sessionStorage (some ao fechar a aba)', 'Token do admin fora do sessionStorage')

// =====================================================================
secao('6. Deploy na Vercel')
// =====================================================================
const vercelTxt = ler('client/vercel.json')
if (!vercelTxt) {
  fail('client/vercel.json não existe', 'sem ele, /admin e /servico/... dão 404 e o site fica sem cabeçalhos de segurança')
} else {
  const v = JSON.parse(vercelTxt)
  const headers = Object.fromEntries((v.headers ?? []).flatMap((h) => h.headers).map((h) => [h.key.toLowerCase(), h.value]))
  checar(v.rewrites?.some((r) => r.destination === '/index.html'), 'Rewrite SPA (rotas do React funcionam ao recarregar)', 'Falta rewrite para /index.html')
  checar(!!headers['content-security-policy'], 'Content-Security-Policy configurada', 'Sem Content-Security-Policy')
  if (headers['content-security-policy']) {
    const csp = headers['content-security-policy']
    checar(/object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /frame-ancestors/.test(csp), "CSP com object-src 'none', base-uri e frame-ancestors", 'CSP incompleta')
    if (/'unsafe-eval'/.test(csp)) warn("CSP permite 'unsafe-eval'")
  }
  checar(!!headers['x-content-type-options'], 'X-Content-Type-Options: nosniff', 'Sem X-Content-Type-Options')
  checar(!!headers['x-frame-options'] || /frame-ancestors/.test(headers['content-security-policy'] ?? ''), 'Proteção contra clickjacking (X-Frame-Options)', 'Sem X-Frame-Options')
  checar(!!headers['strict-transport-security'], 'HSTS (só HTTPS)', 'Sem Strict-Transport-Security')
}
const vite = ler('client/vite.config.js') ?? ''
if (/sourcemap:\s*true/.test(vite)) warn('Build publica sourcemaps (código-fonte legível)', 'sourcemap: false')
else ok('Build sem sourcemaps públicos')
if (existsSync(path.join(ROOT, 'server/.env.example'))) ok('server/.env.example documenta as variáveis')
else warn('Falta server/.env.example')

// =====================================================================
secao('7. Dependências com falhas conhecidas (npm audit)')
// =====================================================================
for (const pasta of ['client', 'server']) {
  if (!existsSync(path.join(ROOT, pasta, 'package-lock.json'))) {
    warn(`${pasta}: sem package-lock.json`, 'rode npm install para gerar')
    continue
  }
  const saida = sh('npm audit --omit=dev --json', path.join(ROOT, pasta))
  let dados
  try {
    dados = JSON.parse(saida)
  } catch {
    warn(`${pasta}: npm audit não rodou (sem internet?)`)
    continue
  }
  const v = dados.metadata?.vulnerabilities ?? {}
  const graves = (v.high ?? 0) + (v.critical ?? 0)
  const total = Object.values(v).reduce((a, b) => a + b, 0)
  if (graves) fail(`${pasta}: ${graves} vulnerabilidade(s) alta/crítica`, `cd ${pasta} && npm audit fix`)
  else if (total) warn(`${pasta}: ${total} vulnerabilidade(s) leve/moderada`, `cd ${pasta} && npm audit`)
  else ok(`${pasta}: nenhuma vulnerabilidade conhecida`)
}

// =====================================================================
if (LIVE) {
  secao(`8. Teste ao vivo: ${LIVE}`)
  const base = LIVE.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'
  const req = async (p, opts = {}) => {
    try {
      return await fetch(base + p, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers } })
    } catch {
      return null
    }
  }

  const saude = await req('/health')
  if (!saude) {
    fail(`API não respondeu em ${base}`, 'ela está rodando?')
  } else {
    checar(saude.ok, 'GET /health responde', `GET /health → ${saude.status}`)
    checar(!saude.headers.get('x-powered-by'), 'Sem X-Powered-By na resposta', 'Resposta expõe X-Powered-By')
    checar(saude.headers.get('x-content-type-options') === 'nosniff', 'Cabeçalhos de segurança presentes', 'Resposta sem nosniff')

    const tentativas = [
      ['POST', '/plans', { name: 'teste', type: 'project' }],
      ['PATCH', '/plans/assinatura', { price: 1 }],
      ['DELETE', '/demos/layout-foto'],
      ['POST', '/reset'],
    ]
    for (const [method, p, body] of tentativas) {
      const r = await req(p, { method, body: body && JSON.stringify(body) })
      checar(r?.status === 401, `${method} ${p} sem login → 401`, `${method} ${p} sem login → ${r?.status}`, 'rota de escrita aberta!')
    }

    const falso = await req('/auth/me', { headers: { Authorization: 'Bearer eyJzdWIiOiJhZG1pbiJ9.assinatura-falsa' } })
    checar(falso?.status === 401, 'Token falsificado é recusado', `Token falsificado → ${falso?.status}`)

    const cors = await req('/plans', { headers: { Origin: 'https://site-malicioso.example' } })
    checar(!cors?.headers.get('access-control-allow-origin'), 'CORS recusa site desconhecido', `CORS liberou: ${cors?.headers.get('access-control-allow-origin')}`)

    const lixo = await req('/demos', { method: 'POST', body: '{nao-e-json' })
    checar([400, 401].includes(lixo?.status), 'JSON inválido não derruba a API', `JSON inválido → ${lixo?.status}`)
  }
}

// =====================================================================
console.log(
  `\n${cor(1, 'Resumo:')} ${cor(32, `${resultado.ok} ok`)} · ${cor(33, `${resultado.warn} atenção`)} · ${cor(31, `${resultado.fail} falha(s)`)}`
)
if (resultado.fail) {
  console.log(cor(31, '✖ Corrija as falhas antes de subir.\n'))
  process.exit(1)
}
console.log(cor(32, '✔ Pronto para o deploy.\n'))
