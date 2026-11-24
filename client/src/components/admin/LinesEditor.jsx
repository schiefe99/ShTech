import { Field, TextInput, TextArea, Select, IconButton, Button } from './ui'
import { updateAt, removeAt, move } from '../../utils/listOps'

const TYPES = [
  { value: 'askName', label: 'Pergunta o nome' },
  { value: 'question', label: 'Pergunta' },
  { value: 'cta', label: 'Botão final (CTA)' },
]

/**
 * Editor das FALAS do robô (a conversa).
 * Cada fala mostra só os campos que fazem sentido para o tipo dela.
 */
export default function LinesEditor({ value = [], onChange }) {
  const change = (i, patch) => onChange(updateAt(value, i, patch))

  return (
    <div className="space-y-3">
      {value.map((line, i) => (
        <div key={line.id ?? i} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-500">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1">
              <Select value={line.type} onChange={(type) => change(i, { type })} options={TYPES} />
            </div>
            <IconButton label="Subir" onClick={() => onChange(move(value, i, -1))} disabled={i === 0}>↑</IconButton>
            <IconButton label="Descer" onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1}>↓</IconButton>
            <IconButton label="Remover fala" onClick={() => onChange(removeAt(value, i))}>✕</IconButton>
          </div>

          <TextArea
            value={line.text}
            onChange={(text) => change(i, { text })}
            rows={2}
            placeholder="O que o robô fala. Use {name} para o nome do visitante."
          />

          {line.type === 'cta' ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Texto do botão">
                <TextInput value={line.ctaLabel} onChange={(ctaLabel) => change(i, { ctaLabel })} placeholder="Falar no WhatsApp" />
              </Field>
              <Field label="Link do botão" hint="https://wa.me ou #contato">
                <TextInput value={line.ctaHref} onChange={(ctaHref) => change(i, { ctaHref })} />
              </Field>
            </div>
          ) : (
            <Field label="Dica no campo de resposta">
              <TextInput value={line.placeholder} onChange={(placeholder) => change(i, { placeholder })} placeholder="Ex: Seu nome" />
            </Field>
          )}
        </div>
      ))}

      <Button variant="ghost" onClick={() => onChange([...value, { type: 'question', text: '', placeholder: '' }])}>
        + Adicionar fala
      </Button>
    </div>
  )
}
