import { whatsappLink } from '../../../utils/whatsapp'

/**
 * FALAR COMIGO: fim da jornada.
 * whatsHref = link que a CONVERSA montou (com nome e respostas).
 * Se o visitante não conversou, usa uma mensagem padrão.
 * As escolhas da jornada (layout, plano) viram linhas extras da mensagem
 * e aparecem num resumo, com "Mudar escolhas" para recomeçar o ciclo.
 */
export default function ChannelContact({ character, visitorName, whatsHref, onExit, journey, onRestart }) {
  const { layout, plan, business } = journey ?? {}
  const extras = [
    layout && `• Layout escolhido: ${layout.title}${business?.name ? ` (para ${business.name}${business.city ? `, ${business.city}` : ''})` : ''}`,
    plan && `• Plano: ${plan.name}`,
  ].filter(Boolean)

  const href = whatsHref
    ? extras.reduce(appendLine, whatsHref)
    : whatsappLink([`Olá! Quero saber mais sobre ${character.role}.`, ...extras].join('\n'))

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <span
        className="h-3 w-3 animate-pulse rounded-full"
        style={{ background: character.eyeColor, boxShadow: `0 0 18px ${character.eyeColor}` }}
      />
      <h2 className="mt-8 text-4xl font-medium leading-tight tracking-tight md:text-6xl">
        {visitorName ? `Bora tirar isso do papel, ${visitorName}?` : 'Bora tirar isso do papel?'}
      </h2>
      <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">
        {whatsHref || extras.length
          ? 'Já montei a mensagem com o que você escolheu. É só enviar.'
          : 'Me chama no WhatsApp e me conta a sua ideia. Respondo rápido.'}
      </p>

      {/* resumo do que foi salvo na jornada */}
      {extras.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {layout && <span className="tv-chip">Layout: {layout.title}</span>}
          {plan && <span className="tv-chip">Plano: {plan.name}</span>}
          <button onClick={onRestart} className="tv-chip hover:bg-white/20">↺ Mudar escolhas</button>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-10 rounded-full px-10 py-4 text-lg font-medium text-black transition hover:scale-105"
        style={{ background: character.eyeColor, boxShadow: `0 0 40px ${character.eyeColor}66` }}
      >
        Falar no WhatsApp
      </a>
      <button onClick={onExit} className="mt-8 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-white">
        Desligar a TV e ver outros serviços
      </button>
    </div>
  )
}

/**
 * Acrescenta uma linha ao texto de um link do WhatsApp já pronto:
 *   https://wa.me/55...?text=Olá  +  'Layout: X'  →  ...?text=Olá%0ALayout: X
 * URL() lê e reescreve o "?text=" sem precisarmos mexer na codificação.
 */
function appendLine(href, line) {
  if (!line) return href
  try {
    const url = new URL(href)
    const atual = url.searchParams.get('text') ?? ''
    url.searchParams.set('text', atual ? `${atual}\n${line}` : line)
    return url.toString()
  } catch {
    return href // link estranho: devolve como estava
  }
}
