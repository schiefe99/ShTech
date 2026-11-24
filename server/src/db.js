import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * DB — abre (ou cria) o arquivo do banco SQLite e aplica o schema.
 *
 * SQLite = banco inteiro num ARQUIVO só (server/shtech.db).
 * Sem instalar servidor de banco: perfeito para começar.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// DB_PATH no ambiente permite usar outro arquivo (ex.: em testes)
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '..', 'shtech.db')

export const db = new Database(DB_PATH)

// WAL: leituras e escritas não se bloqueiam (mais rápido)
db.pragma('journal_mode = WAL')
// O SQLite só respeita FOREIGN KEY se você pedir (padrão é desligado!)
db.pragma('foreign_keys = ON')

db.exec(readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
