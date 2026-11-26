import { useEffect, useRef, useState } from 'react'
import { useDemos } from '../../../hooks/useDemos'
import { getLayout, layoutKeyFromUrl } from '../../../data/layoutPresets'
import { useLayoutHtml } from '../../../utils/renderLanding'

/**
 * LAYOUTS — o visitante digita o nome do negócio e vê TODOS os layouts
 * já com o nome dele; escolhe um, e a escolha vai junto no WhatsApp.
 *
 * As opções vêm das DEMOS do personagem (CRUD do admin): entram só as
 * que têm url '/layout/<key>' (ver data/layoutPresets.js). Cada uma vira
 * uma prévia AO VIVO, já com o nome e a cidade digitados.
 *
 * Props extras (vêm da TvOverlay, que guarda a jornada):
 *   business / setBusiness → { name, city } digitados
 *   picked / onPick        → layout escolhido
 * O botão "Quero este layout" fica na barra da TV (ActionDock) e leva
 * para o canal "Como funciona".
 */
export default function ChannelLayouts({ character, business, setBusiness, picked, onPick }) {
  const { demos, loading } = useDemos(character.id)
  const options = demos.filter((d) => layoutKeyFromUrl(d.url)) // só layouts prontos

  // o texto digitado demora 400ms para chegar nas prévias (debounce):
  // assim as prévias não recarregam a cada letra
  const debounced = useDebounced(business, 400)

  if (loading) return <p className="text-center font-mono text-white/70">Sintonizando...</p>

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-center">
        <h2 className="text-4xl font-medium tracking-tight md:text-6xl">Escolha o seu layout</h2>
        <p className="mt-4 text-lg text-white/80 md:text-xl">
          Digite o nome do seu negócio e veja como ficaria. Tudo pronto para personalizar.
        </p>
      </div>

      {/* nome e cidade: atualizam todas as prévias */}
      <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-[2fr_1fr]">
        <input
          value={business.name}
          onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
          placeholder="Nome do seu negócio"
          className="tv-input"
        />
        <input
          value={business.city}
          onChange={(e) => setBusiness((b) => ({ ...b, city: e.target.value }))}
          placeholder="Cidade"
          className="tv-input"
        />
      </div>

      {/* nenhuma demo com url '/layout/...'? avisa em vez de deixar o espaço vazio */}
      {options.length === 0 && (
        <p className="mx-auto mt-10 max-w-xl rounded-2xl bg-black/40 p-5 text-center text-white/80">
          Nenhum layout cadastrado ainda. No /admin, crie uma demo da LUMA com a url
          <code className="mx-1 font-mono">/layout/essencial</code>(ou foto, animado) e recarregue a página.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((demo, i) => (
          <LayoutCard
            key={demo.id}
            demo={demo}
            business={debounced}
            selected={picked?.id === demo.id}
            onPick={() => onPick(picked?.id === demo.id ? null : { id: demo.id, title: demo.title })}
            delay={0.05 + i * 0.05}
          />
        ))}
      </div>

    </div>
  )
}

/** Um card: prévia ao vivo + nome + o que o layout tem */
function LayoutCard({ demo, business, selected, onPick, delay }) {
  const key = layoutKeyFromUrl(demo.url)
  const layout = getLayout(key)
  const html = useLayoutHtml(key, { businessName: business.name, city: business.city, layoutLabel: demo.title })
  const query = new URLSearchParams({ nome: business.name, cidade: business.city }).toString()

  return (
    <div className="tv-rise" style={{ animationDelay: `${delay}s` }}>
      <div
        className={`tv-card flex h-full flex-col overflow-hidden ${selected ? 'is-picked' : ''}`}
        onClick={onPick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick()}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-white">
          {html ? (
            <ScaledFrame html={html} title={demo.title} />
          ) : (
            <div className="grid h-full w-full place-items-center font-mono text-sm text-black/50">
              {html === null ? 'carregando...' : 'prévia indisponível'}
            </div>
          )}
          {selected && <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">✓ Escolhido</span>}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="tv-accent-text font-mono text-xs uppercase tracking-widest">{layout?.tag ?? demo.niche}</span>
              <h3 className="mt-1 text-xl font-medium">{demo.title}</h3>
            </div>
            <a
              href={`/layout/${key}?${query}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()} // abrir em tela cheia NÃO marca o card
              className="whitespace-nowrap pt-1 text-sm text-white/75 hover:text-white"
            >
              Tela cheia ↗
            </a>
          </div>
          {demo.description && <p className="text-sm leading-relaxed text-white/75">{demo.description}</p>}
          {demo.features?.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-2">
              {demo.features.map((f) => (
                <li key={f} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/85">{f}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Mostra uma página de 1280px de largura ENCOLHIDA para caber no card.
 * ResizeObserver mede o card e calcula a escala (ex.: 380 / 1280 ≈ 0.3).
 */
const PAGE_WIDTH = 1280

function ScaledFrame({ html, title }) {
  const box = useRef(null)
  const [scale, setScale] = useState(0.3)

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PAGE_WIDTH))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="absolute inset-0">
      <iframe
        title={title}
        srcDoc={html}
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 0.625, transform: `scale(${scale})` }}
      />
    </div>
  )
}

/** devolve `value` só depois de `ms` sem mudanças */
function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}
