import './config.js' // carrega o .env antes de ler DB_PATH
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

/**
 * MIGRAÇÕES — mudanças no schema de um banco que JÁ EXISTE.
 *
 * "CREATE TABLE IF NOT EXISTS" não altera tabelas antigas: se a tabela
 * já existe, nada acontece. Então coluna nova precisa de ALTER TABLE.
 * Aqui conferimos as colunas atuais (PRAGMA table_info) e adicionamos
 * só as que faltam — pode rodar quantas vezes quiser sem estragar nada.
 */
function addColumnIfMissing(table, column, type) {
  const existe = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column)
  if (!existe) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
    console.log(`Migração: coluna ${table}.${column} criada`)
  }
}

addColumnIfMissing('characters', 'process', 'TEXT')
