import { whatsappLink } from '../../utils/whatsapp'

/** Formata número em reais: 197 → "R$ 197" */
const brl = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/**
 * Card de plano (Nº004).
 * demosInclusas: quantas demos deste serviço entram na assinatura
 */
export default function PlanCard({ plan, character, demosInclusas = 0 }) {
  const destaque = plan.highlight
  const mensagem = `Olá! Tenho interesse no plano "${plan.name}" para ${character.role}.`

  return (
    <div
      className={`flex flex-col rounded-3xl p-8 ${
        destaque ? 'bg-white text-black' : 'border border-white/15 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-medium">{plan.name}</h3>
        {destaque && (
          <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Mais escolhido</span>
        )}
      </div>
      <p className={`mt-2 ${destaque ? 'text-black/60' : 'text-white/60'}`}>{plan.tagline}</p>

      {/* Preço */}
      <div className="mt-8">
        {plan.pricePrefix && plan.price != null && (
          <span className={`block text-sm ${destaque ? 'text-black/50' : 'text-white/50'}`}>
            {plan.pricePrefix}
          </span>
        )}
        <span className="text-4xl font-semibold tracking-tight">
          {plan.price != null ? brl(plan.price) : 'Sob consulta'}
        </span>
        {plan.price != null && plan.period && (
          <span className={destaque ? 'text-black/50' : 'text-white/50'}> /{plan.period}</span>
        )}
      </div>

      {plan.type === 'subscription' && (
        <p className={`mt-3 text-sm ${destaque ? 'text-black/60' : 'text-white/60'}`}>
          {demosInclusas > 0
            ? `${demosInclusas} layout(s) de ${character.role} disponíveis`
            : `Ainda sem layouts de ${character.role} na assinatura`}
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <span style={{ color: destaque ? '#000' : character.eyeColor }}>✓</span> {f}
          </li>
        ))}
        {plan.limits.map((l) => (
          <li key={l} className={`flex gap-3 ${destaque ? 'text-black/45' : 'text-white/40'}`}>
            <span>–</span> {l}
          </li>
        ))}
      </ul>

      <a
        href={whatsappLink(mensagem)}
        target="_blank"
        rel="noreferrer"
        className={`mt-10 rounded-full px-6 py-3 text-center font-medium transition ${
          destaque ? 'bg-black text-white hover:bg-black/80' : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {plan.ctaLabel}
      </a>
    </div>
  )
}
