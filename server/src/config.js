/**
 * CONFIG — tudo que muda entre o seu PC e a produção vem de VARIÁVEIS
 * DE AMBIENTE, nunca do código. Assim a senha e as chaves não vão
 * para o GitHub.
 *
 *   No seu PC  → arquivo server/.env (está no .gitignore)
 *   Em produção → painel do Render/Railway → "Environment"
 *
 * Modelo de todas as variáveis: server/.env.example
 */

// lê o server/.env se ele existir (Node 20.12+ faz isso sozinho, sem dotenv)
try {
  process.loadEnvFile()
} catch {
  /* sem .env: usa só as variáveis do sistema (normal em produção) */
}

const env = process.env

export const config = {
  isProd: env.NODE_ENV === 'production',
  port: Number(env.PORT ?? 3001),

  // hash da senha do admin (gerado por: npm run hash-senha)
  adminPasswordHash: env.ADMIN_PASSWORD_HASH ?? '',

  // chave que ASSINA os tokens de login (texto aleatório, 32+ caracteres)
  sessionSecret: env.SESSION_SECRET ?? '',

  // quanto tempo o login vale
  sessionHours: Number(env.SESSION_HOURS ?? 8),

  // endereços do front que podem chamar a API, separados por vírgula
  // ex.: https://shtech.vercel.app,https://www.shtech.com.br
  corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // POST /api/reset apaga tudo e recarrega o seed: em produção só se pedir
  allowReset: env.ALLOW_RESET === 'true',
}

/**
 * Confere a configuração ao ligar. Em produção, configuração insegura
 * = servidor NÃO sobe (melhor falhar no deploy do que ficar aberto).
 */
export function checkConfig() {
  const problemas = []
  if (!config.adminPasswordHash.startsWith('scrypt$')) {
    problemas.push('ADMIN_PASSWORD_HASH ausente ou inválido → rode: npm run hash-senha')
  }
  if (config.sessionSecret.length < 32) {
    problemas.push('SESSION_SECRET ausente ou curto (mínimo 32 caracteres) → rode: npm run hash-senha')
  }
  if (config.corsOrigins.includes('*')) {
    problemas.push('CORS_ORIGIN não pode ser "*" (qualquer site poderia chamar a API)')
  }

  if (problemas.length === 0) return
  const msg = problemas.map((p) => `  • ${p}`).join('\n')
  if (config.isProd) {
    console.error(`\n✖ Configuração insegura, servidor não vai subir:\n${msg}\n`)
    process.exit(1)
  }
  console.warn(`\n⚠ Atenção (em produção isso impede o servidor de subir):\n${msg}\n  O login do admin fica DESLIGADO até corrigir.\n`)
}
