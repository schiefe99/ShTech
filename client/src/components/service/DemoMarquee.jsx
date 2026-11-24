import DemoCard from './DemoCard'

/**
 * Galeria em loop infinito (estilo PX PUSH).
 *
 * Truque do loop: renderizamos a lista DUAS vezes lado a lado e
 * animamos de 0 até -50%. Quando a 1ª cópia sai da tela, a 2ª está
 * exatamente onde a 1ª começou → a animação recomeça sem "pulo".
 * (A animação `marquee` está no index.css; pausa ao passar o mouse.)
 *
 * Com poucas demos o loop fica estranho, então repetimos a lista
 * até ter pelo menos MIN_ITEMS cards por cópia.
 */
const MIN_ITEMS = 6

export default function DemoMarquee({ demos, onOpen }) {
  if (demos.length === 0) {
    return <p className="text-white/50">Nenhuma demo cadastrada para este serviço ainda.</p>
  }

  const vezes = Math.ceil(MIN_ITEMS / demos.length)
  const umaCopia = Array.from({ length: vezes }, () => demos).flat()
  const trilho = [...umaCopia, ...umaCopia]

  return (
    <div className="marquee-mask overflow-hidden">
      <div className="animate-marquee flex w-max gap-5">
        {trilho.map((demo, i) => (
          <DemoCard key={`${demo.id}-${i}`} demo={demo} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}
