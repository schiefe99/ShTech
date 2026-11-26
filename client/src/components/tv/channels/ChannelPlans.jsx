import PlanCard from '../../service/PlanCard'
import { usePlans } from '../../../hooks/usePlans'
import { useDemos } from '../../../hooks/useDemos'
import { layoutKeyFromUrl } from '../../../data/layoutPresets'

/**
 * PLANOS: reaproveita o PlanCard da página do serviço.
 * Aqui o botão do card ESCOLHE o plano (onSelectPlan vem da TvOverlay).
 */
export default function ChannelPlans({ character, journey, onSelectPlan }) {
  const { plans } = usePlans()
  const { demos } = useDemos(character.id)
  // robô com layouts prontos (LUMA) conta só eles; os outros contam as demos
  const layouts = demos.filter((d) => layoutKeyFromUrl(d.url))
  const naAssinatura = (layouts.length ? layouts : demos).filter((d) => d.inSubscription).length

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <h2 className="text-4xl font-medium tracking-tight md:text-6xl">Planos</h2>
        <p className="mt-4 text-lg text-white/80 md:text-xl">Comece com um layout pronto ou faça algo exclusivo.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            character={character}
            demosInclusas={naAssinatura}
            onSelect={onSelectPlan} // escolher → aviso "salvo" → Falar comigo
            selected={journey?.plan?.id === plan.id}
          />
        ))}
      </div>
    </div>
  )
}
