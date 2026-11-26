import { useEffect, useRef, useState } from 'react'
import StaticNoise from './StaticNoise'
import { CHANNELS } from './channels'
import { mod } from '../../utils/helpers'
import { useDemos } from '../../hooks/useDemos'
import { useJourney } from '../../hooks/useJourney'
import { layoutKeyFromUrl } from '../../data/layoutPresets'

/**
 * TV OVERLAY — a tela da TV ocupando o site.
 *
 * phase (vem da Home):
 *   'on'  → animação de LIGAR (linha branca → abre → flash)
 *   'off' → animação de DESLIGAR (achata → vira ponto → some)
 *           e no fim chama onTurnedOff() para a câmera voltar
 *
 * Camadas, de trás pra frente:
 *   conteúdo do canal → scanlines → vinheta/reflexo → chiado → letreiros (OSD)
 *
 * JORNADA GUIADA (o caminho que leva o visitante até o WhatsApp):
 *   Layouts ──"Quero este layout"──► Como funciona ──"Seguir"──► Planos
 *     ▲                                                             │
 *     └────"Mudar escolhas"──── Falar comigo ◄──escolheu o plano────┘
 * As escolhas ficam em useJourney (salvas no navegador) e aparecem no
 * indicador de etapas, no topo da TV.
 */
const SWITCH_MS = 380 // duração do chiado ao trocar de canal

// as etapas do indicador do topo: canal + como saber se já foi feita
const STEPS = [
  { id: 'layouts', label: 'Layout', done: (j) => !!j.layout },
  { id: 'processo', label: 'Como funciona', done: (j) => j.processOk },
  { id: 'planos', label: 'Plano', done: (j) => !!j.plan },
  { id: 'contato', label: 'Contato', done: () => false },
]

export default function TvOverlay({ character, phase, visitorName, whatsHref, onExit, onTurnedOff }) {
  // canais que este robô tem: "Layouts" só aparece se houver layouts prontos
  const { demos } = useDemos(character.id)
  const temLayouts = demos.some((d) => layoutKeyFromUrl(d.url))
  const channels = CHANNELS.filter((c) => !c.needsLayouts || temLayouts)

  // guardamos o ID do canal (não a posição): se a lista mudar quando as
  // demos carregarem, o visitante continua no mesmo canal
  const [channelId, setChannelId] = useState(channels[0].id)
  const channel = Math.max(0, channels.findIndex((c) => c.id === channelId))

  // escolhas do visitante (layout, plano...) — salvas no navegador
  const { journey, update, reset } = useJourney(character.id)
  const [toast, setToast] = useState(null) // aviso rápido ("Informações salvas")
  const [noise, setNoise] = useState(true) // começa com chiado (TV ligando)
  // linhas da TV: aparecem a cada canal novo e somem no 1º clique na tela
  const [linesOn, setLinesOn] = useState(true)
  const contentRef = useRef(null)
  const timers = useRef([])

  // agenda um setTimeout e guarda para cancelar se o componente sair
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // chiado inicial some logo depois que a TV liga
  useEffect(() => {
    later(() => setNoise(false), 900)
  }, [])

  function goTo(next) {
    const alvo = mod(next, channels.length)
    if (alvo === channel || phase !== 'on') return
    setNoise(true)
    later(() => {
      setChannelId(channels[alvo].id)
      setLinesOn(true) // canal novo → linhas voltam (e a animação recomeça)
      contentRef.current?.scrollTo(0, 0) // canal novo começa do topo
    }, SWITCH_MS / 2)
    later(() => setNoise(false), SWITCH_MS)
  }

  // vai para um canal pelo id ('planos'); se o canal não existir, ignora
  function goToId(id) {
    const i = channels.findIndex((c) => c.id === id)
    if (i >= 0) goTo(i)
  }

  function showToast(text, ms = 2600) {
    setToast(text)
    later(() => setToast(null), ms)
  }

  // ---------- os passos da jornada ----------
  function confirmLayout() {
    showToast(`✓ Layout "${journey.layout.title}" salvo`)
    goToId('processo')
  }

  function confirmProcess() {
    update('processOk', true)
    goToId('planos')
  }

  function selectPlan(plan) {
    update('plan', { id: plan.id, name: plan.name })
    showToast('✓ Informações salvas! Agora é só falar comigo.')
    later(() => goToId('contato'), 1400) // dá tempo de ler o aviso
  }

  function restart() {
    update('processOk', false)
    update('plan', null)
    goToId(temLayouts ? 'layouts' : 'processo')
  }

  // teclado: ← → trocam de canal, Esc desliga
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') return onExit()
      if (e.target.tagName === 'INPUT') return // digitando: setas movem o cursor do texto
      if (e.key === 'ArrowRight') goTo(channel + 1)
      if (e.key === 'ArrowLeft') goTo(channel - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const { Component, label } = channels[channel]
  const ch = `CH ${String(channel + 1).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div
        className={`tv-screen ${phase === 'off' ? 'crt-off' : 'crt-on'}`}
        style={{ '--tv-accent': character.eyeColor }}
        // a animação de desligar terminou → avisa a Home
        onAnimationEnd={(e) => e.animationName === 'crt-off' && onTurnedOff()}
        // clicou em qualquer lugar da tela → some com as linhas
        onPointerDown={() => setLinesOn(false)}
      >
        {/* ---------- conteúdo do canal (rola por dentro da TV) ----------
            pt/pb = "área segura": o conteúdo nunca passa por baixo do
            letreiro (em cima) nem do controle (embaixo).
            min-h-full + justify-center = canal curto fica no MEIO da tela */}
        <div ref={contentRef} className="tv-content absolute inset-0 overflow-y-auto">
          <div className="flex min-h-full flex-col justify-center px-6 pb-44 pt-40 md:px-16 md:pt-44">
            {/* key: canal novo = componente novo (reinicia animações) */}
            <Component
              key={channelId}
              character={character}
              visitorName={visitorName}
              whatsHref={whatsHref}
              onExit={onExit}
              journey={journey}
              business={journey.business}
              setBusiness={(fn) => update('business', fn)}
              picked={journey.layout}
              onPick={(layout) => update('layout', layout)}
              onSelectPlan={selectPlan}
              onRestart={restart}
              onReset={reset}
            />
          </div>
        </div>

        {/* ---------- efeitos de tubo ---------- */}
        {/* key={channel}: a cada canal o elemento é recriado → animação começa do zero */}
        <div key={channelId} className={`tv-lines ${linesOn ? '' : 'is-off'}`}>
          <div className="tv-scanlines" />
          <div className="tv-rollbar" />
        </div>
        <div className="tv-glass" />
        {noise && <StaticNoise opacity={0.85} />}

        {/* ---------- OSD (letreiros da TV) ---------- */}
        <div className="tv-osd pointer-events-none absolute left-8 top-7 md:left-12 md:top-9">
          <span className="block text-4xl leading-none md:text-6xl">{ch}</span>
          <span className="mt-2 block text-sm opacity-90 md:text-base">{label.toUpperCase()}</span>
        </div>

        <div className="tv-osd absolute right-8 top-7 flex items-center gap-4 text-right text-sm md:right-12 md:top-9 md:text-base">
          <span className="hidden opacity-80 sm:block">
            {character.name} · {character.role.toUpperCase()}
          </span>
          <button onClick={onExit} className="rounded-lg border border-current px-4 py-1.5 hover:bg-white/10">
            ⏻ SAIR
          </button>
        </div>

        {/* ---------- indicador de etapas (topo, no meio) ---------- */}
        <ol className="absolute left-1/2 top-9 z-10 hidden -translate-x-1/2 items-center gap-2 lg:flex">
          {STEPS.filter((s) => channels.some((c) => c.id === s.id)).map((s, i) => {
            const feito = s.done(journey)
            const atual = channels[channel].id === s.id
            return (
              <li key={s.id} className="flex items-center gap-2">
                {i > 0 && <span className="h-px w-6 bg-white/30" />}
                <button
                  onClick={() => goToId(s.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    atual ? 'bg-white text-black' : feito ? 'tv-step-done' : 'bg-black/35 text-white/70 hover:text-white'
                  }`}
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-current text-[10px]">
                    {feito ? '✓' : i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            )
          })}
        </ol>

        {/* ---------- aviso rápido ---------- */}
        {toast && (
          <div
            role="status"
            className="tv-rise absolute left-1/2 top-28 z-20 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-base font-medium text-black shadow-2xl"
          >
            {toast}
          </div>
        )}

        {/* ---------- ação da etapa (logo acima do controle) ----------
            fica FORA da área que rola: sempre visível, sem cobrir os cards */}
        <ActionDock
          channelId={channels[channel].id}
          journey={journey}
          color={character.eyeColor}
          onConfirmLayout={confirmLayout}
          onConfirmProcess={confirmProcess}
        />

        {/* ---------- "controle remoto" ---------- */}
        <nav className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3 px-4 md:bottom-9">
          <button onClick={() => goTo(channel - 1)} className="tv-osd tv-key" aria-label="Canal anterior">◄</button>
          <div className="flex gap-1 overflow-x-auto rounded-full bg-black/45 p-1.5 backdrop-blur">
            {channels.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition md:px-5 md:text-base ${
                  i === channel ? 'bg-white text-black' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button onClick={() => goTo(channel + 1)} className="tv-osd tv-key" aria-label="Próximo canal">►</button>
        </nav>
      </div>
    </div>
  )
}

/**
 * A barra de ação de cada etapa. Cada canal da jornada tem o seu botão
 * de "próximo passo"; nos outros canais a barra não aparece.
 */
function ActionDock({ channelId, journey, color, onConfirmLayout, onConfirmProcess }) {
  let texto = null
  let botao = null

  if (channelId === 'layouts' && journey.layout) {
    texto = (
      <>
        Escolhido: <strong className="tv-accent-text">{journey.layout.title}</strong>
      </>
    )
    botao = { label: 'Quero este layout →', onClick: onConfirmLayout }
  }
  if (channelId === 'processo') {
    texto = journey.layout ? (
      <>
        Layout <strong className="tv-accent-text">{journey.layout.title}</strong> registrado ✓
      </>
    ) : (
      'Entendeu como funciona?'
    )
    botao = { label: 'Seguir para os planos →', onClick: onConfirmProcess }
  }
  if (channelId === 'planos' && !journey.plan) {
    texto = 'Escolha um plano para continuar'
  }

  if (!texto) return null

  return (
    <div className="tv-rise absolute inset-x-0 bottom-[5.5rem] z-10 flex justify-center px-4 md:bottom-[6.5rem]">
      <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/65 px-5 py-3 backdrop-blur">
        <span className="text-white/90">{texto}</span>
        {botao && (
          <button
            onClick={botao.onClick}
            className="rounded-full px-6 py-2.5 font-medium text-black transition hover:scale-105"
            style={{ background: color }}
          >
            {botao.label}
          </button>
        )}
      </div>
    </div>
  )
}
