import { useDemos } from '../../../hooks/useDemos'

/**
 * CH 02 — PORTFÓLIO: grade de projetos; o clique abre o site.
 * (Na próxima etapa: projetos reais com fotos + projetos conceito.)
 */
export default function ChannelPortfolio({ character }) {
  const { demos, loading } = useDemos(character.id)

  if (loading) return <p className="text-center font-mono text-white/70">Sintonizando...</p>
  if (demos.length === 0) return <p className="text-center text-xl text-white/80">Em breve, projetos deste serviço.</p>

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-center">
        <h2 className="text-4xl font-medium tracking-tight md:text-6xl">Projetos</h2>
        <p className="mt-4 text-lg text-white/80 md:text-xl">Clique em um projeto para ver o site.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((d, i) => {
          const Tag = d.url ? 'a' : 'div' // sem link → card não clicável
          return (
            <Tag
              key={d.id}
              {...(d.url ? { href: d.url, target: '_blank', rel: 'noreferrer' } : {})}
              className="tv-rise group block"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="tv-card overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                {d.thumbnail ? (
                  <img src={d.thumbnail} alt={d.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${d.accent}88, #000 75%)` }} />
                )}
              </div>
              <div className="flex items-end justify-between p-6">
                <div>
                  <span className="tv-accent-text font-mono text-xs uppercase tracking-widest">{d.niche}</span>
                  <h3 className="mt-1 text-xl font-medium">{d.title}</h3>
                </div>
                <span className="text-sm text-white/70 group-hover:text-white">{d.url ? 'Ver site ↗' : 'Em breve'}</span>
              </div>
              </div>
            </Tag>
          )
        })}
      </div>
    </div>
  )
}
