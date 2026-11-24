import { useEffect } from 'react'
import { whatsappLink } from '../../utils/whatsapp'

/**
 * Overlay que abre por cima da página ao clicar numa demo:
 * prévia do site (iframe) à esquerda + explicações à direita.
 *
 * Fecha com: clique no fundo, botão "Fechar" ou tecla Esc.
 */
export default function DemoOverlay({ demo, character, onClose }) {
  // Esc fecha + trava o scroll da página enquanto aberto
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowAntes
    }
  }, [onClose])

  const mensagem = `Olá! Vi o layout "${demo.title}" (${demo.niche}) em ${character.role} e quero um assim para o meu negócio.`

  return (
    <div
      onClick={onClose} // clicou no fundo escuro → fecha
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm md:p-10"
    >
      <div
        onClick={(e) => e.stopPropagation()} // clique dentro NÃO fecha
        className="grid max-h-full w-full max-w-6xl gap-8 overflow-auto rounded-3xl bg-neutral-900 p-6 md:grid-cols-[1.6fr_1fr] md:p-8"
      >
        {/* Prévia em "janela de navegador" */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-white/20" />
            <span className="h-3 w-3 rounded-full bg-white/20" />
            <span className="h-3 w-3 rounded-full bg-white/20" />
            <span className="ml-3 truncate font-mono text-xs text-white/50">
              {demo.url ?? 'em breve'}
            </span>
          </div>
          {demo.url ? (
            <iframe
              src={demo.url}
              title={demo.title}
              loading="lazy"
              className="aspect-[16/10] w-full bg-white"
            />
          ) : (
            <div
              className="grid aspect-[16/10] place-items-center"
              style={{ background: `linear-gradient(135deg, ${demo.accent}66, #000 70%)` }}
            >
              <span className="font-mono text-sm text-white/70">Prévia em breve</span>
            </div>
          )}
        </div>

        {/* Explicações */}
        <div className="flex flex-col">
          <button onClick={onClose} className="self-end font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white">
            Fechar ✕
          </button>

          <span className="mt-4 font-mono text-xs uppercase tracking-widest text-white/50">{demo.niche}</span>
          <h3 className="mt-1 text-3xl font-medium">{demo.title}</h3>
          <p className="mt-4 leading-relaxed text-white/70">{demo.description}</p>

          <ul className="mt-6 space-y-2">
            {demo.features.map((f) => (
              <li key={f} className="flex gap-3 text-white/80">
                <span style={{ color: character.eyeColor }}>●</span> {f}
              </li>
            ))}
          </ul>

          {demo.inSubscription && (
            <p className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-white/70">
              Este layout está disponível no <strong className="text-white">plano de Assinatura</strong>.
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <a
              href={whatsappLink(mensagem)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-white/90"
            >
              Quero esse layout
            </a>
            {demo.url && (
              <a
                href={demo.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/25 px-6 py-3 hover:bg-white/10"
              >
                Abrir site ↗
              </a>
            )}
          </div>
          {demo.url && (
            <p className="mt-3 text-xs text-white/40">
              Se a prévia não carregar, alguns sites bloqueiam exibição dentro de outro site — use “Abrir site”.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
