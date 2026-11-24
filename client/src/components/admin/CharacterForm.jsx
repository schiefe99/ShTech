import { Field, TextInput, TextArea, ColorInput, IconButton, Button, FormSection } from './ui'
import LinesEditor from './LinesEditor'
import { updateAt, removeAt, slugify } from '../../utils/listOps'

/**
 * Formulário de PERSONAGEM.
 * set('campo') devolve uma função que atualiza só aquele campo do draft:
 *   <TextInput onChange={set('name')} />  ≡  onChange={(v) => setDraft({ ...draft, name: v })}
 */
export default function CharacterForm({ draft, setDraft, isNew }) {
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }))
  const benefits = draft.benefits ?? []

  return (
    <>
      <FormSection title="Identidade">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <TextInput value={draft.name} onChange={set('name')} placeholder="LUMA" />
          </Field>
          <Field label="Serviço">
            <TextInput value={draft.role} onChange={set('role')} placeholder="Landing Pages" />
          </Field>
        </div>
        {isNew && (
          <Field label="ID" hint={`Aparece na URL: /servico/${draft.id || slugify(draft.name) || '...'} — vazio = gerado a partir do nome`}>
            <TextInput value={draft.id} onChange={(v) => set('id')(slugify(v))} placeholder={slugify(draft.name) || 'luma'} />
          </Field>
        )}
      </FormSection>

      <FormSection title="Cores">
        <Field label="Olhos (cor principal)">
          <ColorInput value={draft.eyeColor} onChange={set('eyeColor')} />
        </Field>
        <Field label="Moldura da TV">
          <ColorInput value={draft.bodyColor} onChange={set('bodyColor')} />
        </Field>
        <Field label="Blusa" hint="Vazio = derivada da cor dos olhos">
          <ColorInput value={draft.shirtColor} onChange={set('shirtColor')} allowEmpty />
        </Field>
      </FormSection>

      <FormSection title="Página do serviço">
        <Field label="Título (tagline)">
          <TextInput value={draft.tagline} onChange={set('tagline')} />
        </Field>
        <Field label="Introdução (Nº001)">
          <TextArea value={draft.intro} onChange={set('intro')} rows={4} />
        </Field>

        <Field label="Benefícios (Nº003)">
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-2 rounded-xl border border-white/10 p-3">
                <div className="flex-1 space-y-2">
                  <TextInput value={b.title} onChange={(title) => set('benefits')(updateAt(benefits, i, { title }))} placeholder="Título" />
                  <TextArea value={b.text} onChange={(text) => set('benefits')(updateAt(benefits, i, { text }))} rows={2} placeholder="Descrição" />
                </div>
                <IconButton label="Remover benefício" onClick={() => set('benefits')(removeAt(benefits, i))}>✕</IconButton>
              </div>
            ))}
            <Button variant="ghost" onClick={() => set('benefits')([...benefits, { title: '', text: '' }])}>
              + Adicionar benefício
            </Button>
          </div>
        </Field>
      </FormSection>

      <FormSection title="Conversa">
        <LinesEditor value={draft.lines} onChange={set('lines')} />
      </FormSection>
    </>
  )
}
