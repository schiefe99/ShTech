import ResourceAdmin from '../../components/admin/ResourceAdmin'
import PlanForm from '../../components/admin/PlanForm'
import { planService } from '../../services/planService'

/** Configuração do CRUD de planos */

const emptyPlan = () => ({
  name: '',
  type: 'subscription',
  tagline: '',
  price: null,
  pricePrefix: '',
  period: 'mês',
  features: [],
  limits: [],
  highlight: false,
  ctaLabel: 'Quero este plano',
})

function validate(p) {
  if (!p.name?.trim()) return 'Dê um nome ao plano'
  if (p.price != null && (Number.isNaN(p.price) || p.price < 0)) return 'Preço inválido'
  return null
}

const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const columns = [
  { label: 'Plano', render: (p) => <strong className="font-medium">{p.name}{p.highlight && ' ★'}</strong> },
  { label: 'Tipo', render: (p) => (p.type === 'subscription' ? 'Assinatura' : 'Projeto') },
  { label: 'Preço', render: (p) => (p.price != null ? `${brl(p.price)}${p.period ? '/' + p.period : ''}` : 'Sob consulta') },
  { label: 'Itens', render: (p) => p.features?.length ?? 0 },
]

export default function PlansAdmin() {
  return (
    <ResourceAdmin
      title="Planos"
      service={planService}
      columns={columns}
      Form={PlanForm}
      emptyItem={emptyPlan}
      validate={validate}
    />
  )
}
