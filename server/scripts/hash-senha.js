/**
 * HASH DA SENHA DO ADMIN — transforma a senha em hash e grava no server/.env
 *
 *   cd server
 *   npm run hash-senha
 *
 * A senha é digitada escondida (não aparece na tela nem fica no histórico
 * do terminal) e NUNCA é salva: só o hash vai para o .env.
 * Se ainda não existir SESSION_SECRET, cria um aleatório.
 *
 * Em produção (Render/Railway), copie do .env os valores de
 * ADMIN_PASSWORD_HASH e SESSION_SECRET para o painel "Environment".
 */
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { hashPassword } from '../src/auth.js'

const ENV_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')

/** pergunta sem mostrar o que é digitado (troca cada letra por "*") */
function askHidden(pergunta) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => rl.output.write(s.includes(pergunta) ? s : s.replace(/[^\r\n]/g, '*'))
    rl.question(pergunta, (resposta) => {
      rl.close()
      process.stdout.write('\n')
      resolve(resposta)
    })
  })
}

/** troca (ou acrescenta) uma linha CHAVE='valor' no texto do .env */
function setVar(texto, chave, valor) {
  const linha = `${chave}='${valor}'` // aspas simples: o "$" do hash fica literal
  const re = new RegExp(`^${chave}=.*$`, 'm')
  return re.test(texto) ? texto.replace(re, linha) : `${texto.trimEnd()}\n${linha}\n`.trimStart()
}

const senha = await askHidden('Nova senha do admin: ')
if (senha.length < 8) {
  console.error('✖ Use pelo menos 8 caracteres.')
  process.exit(1)
}
if ((await askHidden('Repita a senha: ')) !== senha) {
  console.error('✖ As senhas não conferem.')
  process.exit(1)
}

const hash = await hashPassword(senha)
let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''
env = setVar(env, 'ADMIN_PASSWORD_HASH', hash)
if (!/^SESSION_SECRET=.{32,}/m.test(env)) {
  env = setVar(env, 'SESSION_SECRET', randomBytes(48).toString('base64url'))
}
writeFileSync(ENV_PATH, env)

console.log('\n✓ Hash salvo em server/.env (a senha em si não foi salva em lugar nenhum).')
console.log('  Reinicie a API para valer. Em produção, copie ADMIN_PASSWORD_HASH e')
console.log('  SESSION_SECRET do .env para as variáveis de ambiente do servidor.')
