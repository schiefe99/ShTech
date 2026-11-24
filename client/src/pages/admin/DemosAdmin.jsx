import ResourceAdmin from '../../components/admin/ResourceAdmin'
import DemoForm from '../../components/admin/DemoForm'
import { demoService } from '../../services/demoService'
import { useCharacters } from '../../hooks/useCharacters'

/** Configuração do CRUD de demos */

const emptyDemo = () => ({
  characterId: '',
  title: '',
  niche: '',
  url: null,
  thumbnail: null,
  description: '',
  features: [],
  inSubscription: true,
  accent: '#3b5bdb',
})

function validate(d) {
  if (!d.characterId) return 'Escolha a qual serviço (robô) a demo pertence'
  if (!d.title?.trim()) return 'Dê um título à demo'
  if (d.url && !/^https?:\/\//.test(d.url)) return 'O link precisa começar com http:// ou https://'
  return null
}

export default function DemosAdmin() {
  // os personagens servem para o select do formulário e a coluna "Serviço"
  const { characters } = useCharacters()
  const nomeDo = (id) => characters.find((c) => c.id === id)?.name ?? id

  const columns = [
    {
      label: 'Demo',
      render: (d) => (
        <span className="flex items-center gap-3">
          <span className="h-8 w-12 rounded" style={{ background: `linear-gradient(135deg, ${d.accent}, #000)` }} />
          <span>
            <strong className="block font-medium">{d.title}</strong>
            <span className="text-xs text-neutral-500">{d.niche}</span>
          </span>
        </span>
      ),
    },
    { label: 'Serviço', render: (d) => nomeDo(d.characterId) },
    { label: 'Site', render: (d) => (d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="underline">abrir ↗</a> : <span className="text-neutral-500">em breve</span>) },
    { label: 'Assinatura', render: (d) => (d.inSubscription ? '✓' : '—') },
  ]

  return (
    <ResourceAdmin
      title="Demos"
      service={demoService}
      columns={columns}
      Form={DemoForm}
      formProps={{ characters }}
      emptyItem={emptyDemo}
      validate={validate}
    />
  )
}
