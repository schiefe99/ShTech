/**
 * CH 01 — O QUE É: o problema, a solução e os benefícios.
 * Se o visitante disse o nome na conversa, a tela fala com ele.
 *
 * Cores: .tv-card e .tv-accent-text (index.css) usam a cor do robô
 * que a TV define em --tv-accent → cada robô pinta os seus cards.
 */
export default function ChannelAbout({ character, visitorName }) {
  return (
    <div className="mx-auto w-full max-w-6xl text-center">
      <p className="tv-accent-text font-mono text-sm uppercase tracking-[0.3em] md:text-base">
        {visitorName ? `${visitorName}, olha só` : 'Bem-vindo'}
      </p>
      <h2 className="mx-auto mt-5 max-w-5xl text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl xl:text-6xl">
        {character.tagline}
      </h2>
      <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">{character.intro}</p>

      <div className="mt-12 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
        {(character.benefits ?? []).map((b, i) => (
          <div key={b.title} className="tv-rise" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
            <div className="tv-card h-full p-7">
              <span className="tv-accent-text font-mono text-lg">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-5 text-xl font-medium md:text-2xl">{b.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-white/80">{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
