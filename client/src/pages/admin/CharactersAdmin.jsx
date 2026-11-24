import ResourceAdmin from '../../components/admin/ResourceAdmin'
import CharacterForm from '../../components/admin/CharacterForm'
import { characterService } from '../../services/characterService'
import { slugify } from '../../utils/listOps'

/** Configuração do CRUD de personagens */

const emptyCharacter = () => ({
  id: '',
  name: '',
  role: '',
  eyeColor: '#7cffb2',
  bodyColor: '#c4c4c4',
  shirtColor: null,
  tagline: '',
  intro: '',
  benefits: [],
  lines: [
    { type: 'askName', text: 'Oi! Como posso te chamar?', placeholder: 'Seu nome' },
    { type: 'question', text: '{name}, me conta sobre o seu negócio.', placeholder: '' },
    { type: 'cta', text: 'Vamos conversar?', ctaLabel: 'Falar no WhatsApp', ctaHref: 'https://wa.me' },
  ],
})

function validate(c) {
  if (!c.name?.trim()) return 'Dê um nome ao personagem'
  if (!c.role?.trim()) return 'Informe o serviço (ex.: Landing Pages)'
  if (!c.eyeColor) return 'Escolha a cor dos olhos'
  if (!c.lines?.length) return 'A conversa precisa de pelo menos uma fala'
  const vazia = c.lines.findIndex((l) => !l.text?.trim())
  if (vazia !== -1) return `A fala ${vazia + 1} está sem texto`
  const ultima = c.lines[c.lines.length - 1]
  if (ultima.type !== 'cta') return 'A última fala precisa ser o “Botão final (CTA)”'
  if (!ultima.ctaLabel?.trim()) return 'Escreva o texto do botão final'
  return null
}

// ajustes antes de enviar: gera o id e numera as falas na ordem da tela
function beforeSave(c, { isNew }) {
  return {
    ...c,
    id: isNew ? c.id?.trim() || slugify(c.name) : c.id,
    lines: c.lines.map((line, i) => ({ ...line, order: i + 1 })),
  }
}

const columns = [
  {
    label: 'Robô',
    render: (c) => (
      <span className="flex items-center gap-3">
        <span className="h-4 w-4 rounded-full" style={{ background: c.eyeColor, boxShadow: `0 0 10px ${c.eyeColor}` }} />
        <strong className="font-medium">{c.name}</strong>
      </span>
    ),
  },
  { label: 'Serviço', render: (c) => c.role },
  { label: 'URL', render: (c) => <code className="text-neutral-400">/servico/{c.id}</code> },
  { label: 'Falas', render: (c) => c.lines?.length ?? 0 },
]

export default function CharactersAdmin() {
  return (
    <ResourceAdmin
      title="Personagens"
      service={characterService}
      columns={columns}
      Form={CharacterForm}
      emptyItem={emptyCharacter}
      validate={validate}
      beforeSave={beforeSave}
    />
  )
}
