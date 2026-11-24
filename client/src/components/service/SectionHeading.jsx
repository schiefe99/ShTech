/**
 * Cabeçalho editorial das seções: "● Nº001  Título"
 * accent = cor do ponto (a cor dos olhos do robô)
 */
export default function SectionHeading({ number, title, accent = '#fff' }) {
  return (
    <div className="mb-10 flex items-baseline gap-4 border-t border-white/15 pt-6">
      <span className="font-mono text-sm text-white/50">
        <span style={{ color: accent }}>●</span> Nº{String(number).padStart(3, '0')}
      </span>
      <h2 className="text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
    </div>
  )
}
