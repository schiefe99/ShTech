import { randomUUID } from 'node:crypto'
import { db } from '../db.js'

/**
 * FÁBRICA DE REPOSITÓRIOS — o "par" do createLocalService do front.
 *
 * Repositório = a única camada que escreve SQL. As rotas pedem
 * "lista as demos do luma" e não sabem nada de SELECT/WHERE.
 *
 *   const demoRepo = createRepository({
 *     table: 'demos',
 *     columns: ['characterId', 'order', 'title', ...],
 *     json: ['features'],          // guardados como texto JSON
 *     bool: ['inSubscription'],    // guardados como 0/1
 *     filterable: ['characterId'], // campos aceitos em ?filtro=
 *   })
 *
 * SEGURANÇA: valores SEMPRE entram por parâmetro (@campo), nunca
 * colados na string do SQL → protege contra SQL injection.
 * Nomes de coluna vêm só da lista `columns` (nunca do usuário).
 */
export function createRepository({ table, columns, json = [], bool = [], filterable = [] }) {
  const allColumns = ['id', ...columns]
  const quote = (c) => `"${c}"`

  // ---------- conversões objeto JS ↔ linha do banco ----------

  // JS → banco: undefined vira NULL, listas viram JSON, booleanos viram 1/0
  function toRow(obj) {
    const row = {}
    for (const c of allColumns) {
      let v = obj[c]
      if (bool.includes(c)) v = v ? 1 : 0 // ausente/null = false
      else if (v === undefined) v = null
      else if (json.includes(c) && v !== null) v = JSON.stringify(v)
      row[c] = v
    }
    return row
  }

  // banco → JS: o caminho inverso
  function fromRow(row) {
    if (!row) return null
    const obj = { ...row }
    for (const c of json) obj[c] = row[c] ? JSON.parse(row[c]) : []
    for (const c of bool) obj[c] = Boolean(row[c])
    return obj
  }

  // ---------- SQL preparado uma vez (mais rápido que montar sempre) ----------

  const sql = {
    get: db.prepare(`SELECT * FROM ${table} WHERE id = ?`),
    insert: db.prepare(
      `INSERT INTO ${table} (${allColumns.map(quote).join(', ')})
       VALUES (${allColumns.map((c) => '@' + c).join(', ')})`
    ),
    update: db.prepare(
      `UPDATE ${table} SET ${columns.map((c) => `${quote(c)} = @${c}`).join(', ')}
       WHERE id = @id`
    ),
    remove: db.prepare(`DELETE FROM ${table} WHERE id = ?`),
    nextOrder: db.prepare(`SELECT COALESCE(MAX("order"), 0) + 1 AS n FROM ${table}`),
  }

  return {
    /** list({ characterId: 'luma' }) → só os campos de `filterable` valem */
    list(filter = {}) {
      const fields = Object.keys(filter).filter((f) => filterable.includes(f))
      const where = fields.length
        ? 'WHERE ' + fields.map((f) => `${quote(f)} = @${f}`).join(' AND ')
        : ''
      const params = Object.fromEntries(fields.map((f) => [f, filter[f]]))
      return db
        .prepare(`SELECT * FROM ${table} ${where} ORDER BY "order", rowid`)
        .all(params)
        .map(fromRow)
    },

    get(id) {
      return fromRow(sql.get.get(id))
    },

    create(data) {
      const row = toRow({
        order: sql.nextOrder.get().n,
        ...data,
        id: data.id || randomUUID(), // aceita id "bonito" (ex.: 'luma') ou gera um
      })
      sql.insert.run(row)
      return this.get(row.id)
    },

    /** atualização PARCIAL: junta o que existe com o que chegou */
    update(id, patch) {
      const atual = this.get(id)
      if (!atual) return null
      sql.update.run(toRow({ ...atual, ...patch, id }))
      return this.get(id)
    },

    /** true se apagou, false se não existia */
    remove(id) {
      return sql.remove.run(id).changes > 0
    },
  }
}
