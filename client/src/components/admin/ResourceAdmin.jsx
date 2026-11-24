import { useEffect, useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { Button } from './ui'

/**
 * RESOURCE ADMIN — tela de CRUD GENÉRICA.
 * Personagens, demos e planos usam ESTE componente; cada um só
 * passa a sua configuração:
 *
 *   title      → título da tela
 *   service    → o service do recurso (characterService, demoService...)
 *   columns    → colunas da tabela: [{ label, render: (item) => ... }]
 *   Form       → componente do formulário: recebe { draft, setDraft, isNew, ...formProps }
 *   emptyItem  → () => objeto novo em branco
 *   validate   → (draft, { isNew }) => mensagem de erro ou null
 *   beforeSave → (draft, { isNew }) => draft ajustado (opcional)
 *   itemLabel  → (item) => nome mostrado na confirmação de exclusão
 *
 * Estado:
 *   draft     → cópia que está sendo editada (null = formulário fechado)
 *   editingId → id do item em edição (null = criando um novo)
 */
export default function ResourceAdmin({
  title,
  service,
  columns,
  Form,
  formProps = {},
  emptyItem,
  validate = () => null,
  beforeSave = (d) => d,
  itemLabel = (item) => item.name ?? item.title ?? item.id,
}) {
  const { items, loading, error, create, update, remove } = useCollection(service)
  const [draft, setDraft] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [listError, setListError] = useState(null)

  const isNew = editingId === null
  const aberto = draft !== null

  function openNew() {
    setDraft(emptyItem())
    setEditingId(null)
    setFormError(null)
  }

  function openEdit(item) {
    // structuredClone: edita uma CÓPIA → cancelar não estraga a lista
    setDraft(structuredClone(item))
    setEditingId(item.id)
    setFormError(null)
  }

  function close() {
    setDraft(null)
    setEditingId(null)
  }

  // Esc fecha o formulário
  useEffect(() => {
    if (!aberto) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto])

  async function handleSave(e) {
    e.preventDefault()
    // 1º valida no front (resposta imediata), o back valida de novo (segurança)
    const erro = validate(draft, { isNew })
    if (erro) return setFormError(erro)

    try {
      setSaving(true)
      setFormError(null)
      const dados = beforeSave(draft, { isNew })
      if (isNew) {
        await create(dados)
      } else {
        const { id, ...patch } = dados // o id vai na URL, não no corpo
        await update(editingId, patch)
      }
      close()
    } catch (err) {
      setFormError(err.message) // mensagem que a API mandou (ex.: id duplicado)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    const ok = window.confirm(`Apagar "${itemLabel(item)}"? Isso não pode ser desfeito.`)
    if (!ok) return
    try {
      setListError(null)
      await remove(item.id)
    } catch (err) {
      setListError(err.message)
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
        <Button onClick={openNew}>+ Novo</Button>
      </div>

      {(error || listError) && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error || listError}</p>
      )}

      {/* ---------- tabela ---------- */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
            <tr>
              {columns.map((c) => (
                <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-neutral-500">Carregando...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-neutral-500">Nada cadastrado ainda.</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                {columns.map((c) => (
                  <td key={c.label} className="px-4 py-3">{c.render(item)}</td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Button variant="ghost" onClick={() => openEdit(item)}>Editar</Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(item)}>Apagar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- formulário (gaveta lateral) ---------- */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={close}>
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()} // clique dentro não fecha
            className="flex h-full w-full max-w-xl flex-col bg-neutral-900 shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-medium">{isNew ? `Novo — ${title}` : `Editar — ${itemLabel(draft)}`}</h2>
              <button type="button" onClick={close} className="text-neutral-400 hover:text-white">✕</button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <Form draft={draft} setDraft={setDraft} isNew={isNew} {...formProps} />
            </div>

            <footer className="border-t border-white/10 px-6 py-4">
              {formError && <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={close}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </section>
  )
}
