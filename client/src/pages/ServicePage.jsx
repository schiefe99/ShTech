import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Scene from '../components/three/Scene'
import TvRobot from '../components/three/robot/TvRobot'
import SectionHeading from '../components/service/SectionHeading'
import DemoMarquee from '../components/service/DemoMarquee'
import DemoOverlay from '../components/service/DemoOverlay'
import PlanCard from '../components/service/PlanCard'
import { useCharacters } from '../hooks/useCharacters'
import { useDemos } from '../hooks/useDemos'
import { usePlans } from '../hooks/usePlans'
import { whatsappLink } from '../utils/whatsapp'

/**
 * SERVICE PAGE — /servico/:id  (estilo PX PUSH)
 *
 *   Topo     → robô do serviço + tagline
 *   Nº001    → intro: o problema e a solução
 *   Nº002    → galeria de demos (clique abre o overlay)
 *   Nº003    → benefícios
 *   Nº004    → planos
 *
 * Tudo vem dos dados: trocar texto, demo ou plano = mexer no seed
 * (e, no Dia 4, no painel /admin).
 */
export default function ServicePage() {
  const { id } = useParams() // o ":id" da URL
  const { characters, loading } = useCharacters()
  const { demos } = useDemos(id)
  const { plans } = usePlans()
  const [demoAberta, setDemoAberta] = useState(null)

  // Ao entrar na página, volta para o topo.
  // CHAVES { } são obrigatórias aqui: sem elas a arrow function RETORNA
  // o resultado de scrollTo, e o React acha que é uma função de limpeza.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (loading) return <p className="p-8">Carregando...</p>

  const character = characters.find((c) => c.id === id)
  if (!character) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-950 text-white">
        <div className="text-center">
          <p className="text-2xl">Serviço não encontrado.</p>
          <Link to="/" className="mt-4 inline-block underline">Voltar para os robôs</Link>
        </div>
      </div>
    )
  }

  const accent = character.eyeColor
  const demosNaAssinatura = demos.filter((d) => d.inSubscription).length

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
        <Link to="/" className="font-mono text-sm uppercase tracking-widest hover:underline">
          ← Robôs
        </Link>
        <span className="text-xl font-medium tracking-tight">SHTECH®</span>
        <a href="#planos" className="font-mono text-sm uppercase tracking-widest hover:underline">
          Planos
        </a>
      </header>

      {/* ---------- Topo ---------- */}
      <section className="relative grid min-h-screen items-center gap-6 px-6 pt-24 md:grid-cols-2 md:px-10">
        <div className="z-10">
          <p className="font-mono text-sm uppercase tracking-widest text-white/50">
            <span style={{ color: accent }}>●</span> {character.name} — {character.role}
          </p>
          <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            {character.tagline}
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#demos" className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-white/90">
              Ver demos
            </a>
            <a href="#planos" className="rounded-full border border-white/25 px-6 py-3 hover:bg-white/10">
              Ver planos
            </a>
          </div>
        </div>

        {/* robô do serviço, olhando para o mouse */}
        {/* robot-fade (index.css): máscara que dissolve as bordas do canvas */}
        <div className="robot-fade h-[60vh] md:h-[85vh]">
          <Scene fog={false} background="#0a0a0a">
            <group position={[0, 0.9, 0]} scale={0.95}>
              <TvRobot character={character} active />
            </group>
          </Scene>
        </div>
      </section>

      <main className="space-y-32 px-6 pb-32 md:px-10">
        {/* ---------- Nº001 Intro ---------- */}
        <section>
          <SectionHeading number={1} title="Por que isso importa" accent={accent} />
          <p className="max-w-3xl text-2xl leading-relaxed text-white/80 md:text-3xl">
            {character.intro}
          </p>
        </section>

        {/* ---------- Nº002 Demos ---------- */}
        <section id="demos" className="scroll-mt-24">
          <SectionHeading number={2} title="Demos" accent={accent} />
          <p className="mb-8 max-w-xl text-white/60">
            Layouts prontos para o seu nicho. Clique em um para ver de perto. Os marcados com
            “Na assinatura” podem ser usados no plano mensal.
          </p>
          {/* margem negativa = "fura" o padding do main → galeria de ponta a ponta */}
          <div className="-mx-6 md:-mx-10">
            <DemoMarquee demos={demos} onOpen={setDemoAberta} />
          </div>
        </section>

        {/* ---------- Nº003 Benefícios ---------- */}
        <section>
          <SectionHeading number={3} title="Benefícios" accent={accent} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(character.benefits ?? []).map((b, i) => (
              <div key={b.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <span className="font-mono text-sm text-white/40">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-xl font-medium">{b.title}</h3>
                <p className="mt-2 text-white/60">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Nº004 Planos ---------- */}
        <section id="planos" className="scroll-mt-24">
          <SectionHeading number={4} title="Planos" accent={accent} />
          <div className="grid gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                character={character}
                demosInclusas={demosNaAssinatura}
              />
            ))}
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section id="contato" className="rounded-3xl p-10 text-center md:p-16" style={{ background: `${accent}22` }}>
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Vamos tirar isso do papel?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Me conta sua ideia no WhatsApp. Respondo rápido e te ajudo a escolher o melhor caminho.
          </p>
          <a
            href={whatsappLink(`Olá! Quero saber mais sobre ${character.role}.`)}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-medium text-black hover:bg-white/90"
          >
            Falar no WhatsApp
          </a>
        </section>
      </main>

      {demoAberta && (
        <DemoOverlay demo={demoAberta} character={character} onClose={() => setDemoAberta(null)} />
      )}
    </div>
  )
}
