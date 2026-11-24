import { Field, TextInput, TextArea, Select, Checkbox, ColorInput, FormSection } from './ui'
import StringListEditor from './StringListEditor'

/** Formulário de DEMO. `characters` vem de fora para montar o select. */
export default function DemoForm({ draft, setDraft, characters = [] }) {
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }))

  return (
    <>
      <FormSection title="Demo">
        <Field label="Serviço (robô)">
          <Select
            value={draft.characterId}
            onChange={set('characterId')}
            options={[
              { value: '', label: 'Escolha...' },
              ...characters.map((c) => ({ value: c.id, label: `${c.name} — ${c.role}` })),
            ]}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Título">
            <TextInput value={draft.title} onChange={set('title')} placeholder="Studio Beleza" />
          </Field>
          <Field label="Nicho">
            <TextInput value={draft.niche} onChange={set('niche')} placeholder="Estética e beleza" />
          </Field>
        </div>
        <Field label="Descrição">
          <TextArea value={draft.description} onChange={set('description')} rows={3} />
        </Field>
        <Checkbox checked={draft.inSubscription} onChange={set('inSubscription')} label="Disponível no plano de Assinatura" />
      </FormSection>

      <FormSection title="Visual e links">
        <Field label="Link do site" hint="Vazio = aparece como “em breve”">
          <TextInput value={draft.url} onChange={(v) => set('url')(v || null)} placeholder="https://..." />
        </Field>
        <Field label="Imagem do card" hint="Arquivo em client/public, ex.: /demos/mallu.jpg">
          <TextInput value={draft.thumbnail} onChange={(v) => set('thumbnail')(v || null)} placeholder="/demos/arquivo.jpg" />
        </Field>
        <Field label="Cor do card (quando não há imagem)">
          <ColorInput value={draft.accent} onChange={set('accent')} />
        </Field>
      </FormSection>

      <FormSection title="O que tem no layout">
        <StringListEditor value={draft.features} onChange={set('features')} placeholder="Ex: Animações no scroll" />
      </FormSection>
    </>
  )
}
