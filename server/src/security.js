/**
 * SEGURANÇA DA API — cabeçalhos e validações que valem para todas as rotas.
 */

/**
 * Cabeçalhos de segurança (o que o pacote "helmet" faz, em versão enxuta).
 * A API só devolve JSON, então pode ser bem restritiva.
 */
export function securityHeaders(req, res, next) {
  res.set({
    // o navegador não "adivinha" o tipo do arquivo (evita executar JSON como script)
    'X-Content-Type-Options': 'nosniff',
    // a API não pode ser aberta dentro de <iframe> de outro site
    'X-Frame-Options': 'DENY',
    // JSON não precisa carregar nada: bloqueia tudo
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    // não manda o endereço da página de origem para outros sites
    'Referrer-Policy': 'no-referrer',
    // respostas da API não ficam guardadas em cache compartilhado
    'Cache-Control': 'no-store',
    // só HTTPS por 1 ano (o navegador ignora em http://localhost)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  })
  next()
}

// ---------- validação de campos ----------

/**
 * Links que podem ir para o banco: http(s), caminho do próprio site
 * ("/layout/foto"), âncora ("#contato") ou vazio. Bloqueia "javascript:alert(1)" e afins,
 * que virariam código rodando quando alguém clicasse no link.
 */
export function isSafeUrl(v) {
  if (v === null || v === undefined || v === '') return true
  if (typeof v !== 'string' || v.length > 2000) return false
  if (/^#[\w-]*$/.test(v)) return true // âncora na mesma página
  if (/^\/(?!\/)/.test(v)) return true // "/algo", mas não "//outro-site.com"
  try {
    const u = new URL(v)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const isColor = (v) => v == null || v === '' || /^#[0-9a-f]{3,8}$/i.test(v)

/**
 * Regras por recurso. Cada função recebe o corpo da requisição e devolve
 * a mensagem de erro (ou null). Roda DEPOIS dos campos obrigatórios.
 */
export const rules = {
  demos(body) {
    for (const campo of ['url', 'thumbnail']) {
      if (campo in body && !isSafeUrl(body[campo])) return `"${campo}" precisa ser um link https:// ou um caminho /...`
    }
    if ('accent' in body && !isColor(body.accent)) return '"accent" precisa ser uma cor #RRGGBB'
    return null
  },

  characters(body) {
    for (const campo of ['bodyColor', 'eyeColor', 'shirtColor']) {
      if (campo in body && !isColor(body[campo])) return `"${campo}" precisa ser uma cor #RRGGBB`
    }
    if ('lines' in body) {
      if (!Array.isArray(body.lines) || body.lines.length > 50) return '"lines" precisa ser uma lista (até 50 falas)'
      if (body.lines.some((l) => !isSafeUrl(l?.ctaHref))) return 'O link (ctaHref) de uma fala é inválido'
    }
    return null
  },

  plans() {
    return null
  },
}

/**
 * Limite de tamanho dos textos: ninguém precisa de 1 MB num título.
 * (o express.json já barra corpos acima de 100 kb no total)
 */
export function tooLong(body, max = 5000) {
  for (const [k, v] of Object.entries(body ?? {})) {
    if (typeof v === 'string' && v.length > max) return `O campo "${k}" passou de ${max} caracteres`
  }
  return null
}
