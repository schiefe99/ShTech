import { Field, TextInput, Select, Checkbox, FormSection } from './ui'
import StringListEditor from './StringListEditor'

/** Formulário de PLANO */
export default function PlanForm({ draft, setDraft }) {
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }))

  return (
    <>
      <FormSection title="Plano">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <TextInput value={draft.name} onChange={set('name')} />
          </Field>
          <Field label="Tipo">
            <Select
              value={draft.type}
              onChange={set('type')}
              options={[
                { value: 'subscription', label: 'Assinatura (mensal)' },
                { value: 'project', label: 'Projeto (único)' },
              ]}
            />
          </Field>
        </div>
        <Field label="Frase de apoio">
          <TextInput value={draft.tagline} onChange={set('tagline')} />
        </Field>
        <Checkbox checked={draft.highlight} onChange={set('highlight')} label="Destacar (“Mais escolhido”)" />
      </FormSection>

      <FormSection title="Preço">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Antes do preço">
            <TextInput value={draft.pricePrefix} onChange={set('pricePrefix')} placeholder="a partir de" />
          </Field>
          <Field label="Preço (R$)" hint="Vazio = Sob consulta">
            {/* input devolve texto: '' vira null, '197' vira 197 (número) */}
            <TextInput
              type="number"
              min="0"
              value={draft.price ?? ''}
              onChange={(v) => set('price')(v === '' ? null : Number(v))}
            />
          </Field>
          <Field label="Período">
            <TextInput value={draft.period} onChange={(v) => set('period')(v || null)} placeholder="mês" />
          </Field>
        </div>
        <Field label="Texto do botão">
          <TextInput value={draft.ctaLabel} onChange={set('ctaLabel')} placeholder="Quero assinar" />
        </Field>
      </FormSection>

      <FormSection title="Inclui">
        <StringListEditor value={draft.features} onChange={set('features')} />
      </FormSection>

      <FormSection title="Limitações">
        <StringListEditor value={draft.limits} onChange={set('limits')} placeholder="Ex: Somente layouts da galeria" />
      </FormSection>
    </>
  )
}
