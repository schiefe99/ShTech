/**
 * COMO FUNCIONA: as etapas do projeto, em ordem.
 * Cada personagem pode ter as SUAS etapas (campo `process`, editável no
 * admin). Sem isso, usa as etapas padrão abaixo.
 */
const DEFAULT_STEPS = [
  { title: 'Conversa', time: 'Dia 1', text: 'Você me conta o negócio, o público e o objetivo do site.' },
  { title: 'Layout', time: 'Dias 2–4', text: 'Monto o visual no Figma: você vê tudo antes de virar código.' },
  { title: 'Aprovação', time: 'Dia 5', text: 'Ajustamos juntos até ficar do jeito que você quer.' },
  { title: 'Desenvolvimento', time: 'Dias 6–10', text: 'O site ganha vida: rápido, responsivo e pronto para o Google.' },
  { title: 'No ar', time: 'Dia 11+', text: 'Publicado no seu domínio, com acompanhamento depois da entrega.' },
]

// número de colunas no computador = número de etapas (até 5)
const COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5' }

export default function ChannelProcess({ character }) {
  const steps = character.process?.length ? character.process : DEFAULT_STEPS

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-center">
        <h2 className="text-4xl font-medium tracking-tight md:text-6xl">Como funciona</h2>
        <p className="mt-4 text-lg text-white/80 md:text-xl">Do primeiro “oi” ao site no ar, sem surpresa.</p>
      </div>

      {/* etapas lado a lado (empilham no celular), ligadas por uma linha */}
      <ol className={`relative mt-14 grid gap-5 ${COLS[Math.min(steps.length, 5)]}`}>
        <span className="absolute left-0 right-0 top-[2.1rem] hidden h-px bg-white/25 md:block" />
        {steps.map((s, i) => (
          <li key={s.title} className="tv-rise relative" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
            <div className="tv-card h-full p-6">
              <span
                className="block h-4 w-4 rounded-full"
                style={{ background: character.eyeColor, boxShadow: `0 0 14px ${character.eyeColor}` }}
              />
              <span className="tv-accent-text mt-5 block font-mono text-xs uppercase tracking-widest">{s.time}</span>
              <h3 className="mt-1 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
