/**
 * Card de uma demo na galeria.
 * Com thumbnail → mostra a imagem. Sem → gradiente na cor `accent`.
 */
export default function DemoCard({ demo, onOpen }) {
  const emBreve = !demo.url

  return (
    <button
      onClick={() => onOpen(demo)}
      className="group relative aspect-[16/10] w-[380px] shrink-0 overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:-translate-y-1 md:w-[460px]"
    >
      {demo.thumbnail ? (
        <img src={demo.thumbnail} alt={demo.title} className="h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${demo.accent}cc, transparent 60%),
                         linear-gradient(135deg, ${demo.accent}55, #0b0b0d 70%)`,
          }}
        />
      )}

      {/* Texto por cima, com degradê escuro embaixo para dar leitura */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-6">
        <span className="font-mono text-xs uppercase tracking-widest text-white/60">{demo.niche}</span>
        <span className="mt-1 text-2xl font-medium">{demo.title}</span>
        <span className="mt-3 text-sm text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
          {emBreve ? 'Em breve · ver detalhes' : 'Clique para ver →'}
        </span>
      </div>

      {demo.inSubscription && (
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black">
          Na assinatura
        </span>
      )}
    </button>
  )
}
