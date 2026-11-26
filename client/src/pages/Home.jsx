import { useEffect, useRef, useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import Scene from '../components/three/Scene'
import CharacterCarousel from '../components/three/CharacterCarousel'
import CameraRig from '../components/three/CameraRig'
import ChatPanel from '../components/chat/ChatPanel'
import TvOverlay from '../components/tv/TvOverlay'
import { useCharacters } from '../hooks/useCharacters'
import { mod } from '../utils/helpers'

/**
 * HOME — roda de robôs + conversa + "entrar na TV".
 *
 * A URL manda na TV:
 *   /              → TV desligada (roda de robôs)
 *   /servico/luma  → TV do LUMA ligada
 * Assim dá para compartilhar o link direto de um serviço, e o botão
 * "voltar" do navegador desliga a TV.
 *
 * FASES da transição (uma "máquina de estados"):
 *
 *   idle ──abrir──► zooming ──câmera chegou──► on ──sair──► off
 *    ▲                                                       │
 *    └────── câmera voltou ◄────── leaving ◄──TV desligou────┘
 */
const FALLBACK_MS = 3000 // se a câmera "não chegar" por algum motivo, segue assim mesmo

export default function Home() {
  const { characters, loading, error } = useCharacters()
  const [step, setStep] = useState(0)
  const [visitorName, setVisitorName] = useState('')

  const navigate = useNavigate()
  const tvId = useMatch('/servico/:id')?.params.id // id na URL (ou undefined)

  const [phase, setPhase] = useState('idle')
  const [tvCharacter, setTvCharacter] = useState(null) // robô cuja TV está aberta
  const whatsHref = useRef(null) // link montado pela conversa
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const total = characters.length
  const activeIndex = total ? mod(step, total) : 0

  // ---------- a URL mudou → liga ou desliga a TV ----------
  useEffect(() => {
    if (!total) return
    if (tvId) {
      const i = characters.findIndex((c) => c.id === tvId)
      if (i === -1) return navigate('/', { replace: true }) // id inexistente
      // gira a roda até esse robô (caminho mais curto)
      setStep((s) => {
        let diff = i - mod(s, total)
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total
        return s + diff
      })
      setTvCharacter(characters[i])
      setPhase((p) => (p === 'idle' || p === 'leaving' ? 'zooming' : p))
    } else {
      setPhase((p) => (p === 'on' ? 'off' : p === 'zooming' ? 'leaving' : p))
    }
  }, [tvId, characters, total, navigate])

  // rede de segurança: nenhuma fase de câmera fica presa para sempre
  useEffect(() => {
    if (phase !== 'zooming' && phase !== 'leaving') return
    const t = setTimeout(() => setPhase((p) => (p === 'zooming' ? 'on' : p === 'leaving' ? 'idle' : p)), FALLBACK_MS)
    return () => clearTimeout(t)
  }, [phase])

  function openTv(character, href = null) {
    whatsHref.current = href
    navigate(`/servico/${character.id}`)
  }
  const closeTv = () => navigate('/')

  // câmera chegou ao destino
  function handleArrive() {
    setPhase((p) => (p === 'zooming' ? 'on' : p === 'leaving' ? 'idle' : p))
  }

  // setas trocam de robô — só com a TV desligada e fora de um input
  useEffect(() => {
    function onKey(e) {
      if (phaseRef.current !== 'idle' || e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setStep((s) => s + 1)
      if (e.key === 'ArrowLeft') setStep((s) => s - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return <p className="p-8">Carregando...</p>
  if (error) return <p className="p-8 text-red-600">Erro: {error}</p>
  if (total === 0) return <p className="p-8">Nenhum personagem cadastrado.</p>

  const atual = characters[activeIndex]
  const tvLigada = phase === 'on' || phase === 'off'
  const uiVisivel = phase === 'idle'

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-neutral-200 to-neutral-400">
      {/* Camada 3D (fundo) */}
      <div className="absolute inset-0">
        <Scene>
          <group position={[1.0, 0.1, 0]} scale={1.25}>
            <CharacterCarousel
              characters={characters}
              step={step}
              onSelect={(s) => phase === 'idle' && setStep(s)}
              focusId={phase === 'idle' ? null : tvCharacter?.id}
              onEnter={phase === 'idle' ? (c) => openTv(c) : undefined}
            />
          </group>
          <CameraRig phase={phase} targetId={tvCharacter?.id} onArrive={handleArrive} />
        </Scene>
      </div>

      {/* Camada HTML: some durante a transição (opacity + sem cliques) */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between p-8 transition-opacity duration-500 md:p-10 ${
          uiVisivel ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <header className="flex items-center justify-between">
          <span className="text-2xl font-medium tracking-tight">SHTECH®</span>
          <button onClick={() => openTv(atual)} className={`text-xl hover:underline ${uiVisivel ? 'pointer-events-auto' : ''}`}>
            Vamos conversar
          </button>
        </header>

        <section className={uiVisivel ? 'pointer-events-auto' : ''}>
          {/* key: trocar de robô remonta o painel (zera o input) */}
          <ChatPanel
            key={atual.id}
            character={atual}
            visitorName={visitorName}
            onNameChange={setVisitorName}
            onOpenTv={(href) => openTv(atual, href)}
          />
        </section>

        <footer className={`flex items-center gap-4 ${uiVisivel ? 'pointer-events-auto' : ''}`}>
          <button
            onClick={() => setStep((s) => s - 1)}
            aria-label="Robô anterior"
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-900 text-white"
          >
            ←
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            aria-label="Próximo robô"
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-900 text-white"
          >
            →
          </button>
          <span className="text-sm text-neutral-600">
            {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </footer>
      </div>

      {/* A TV em tela cheia (só enquanto ligada ou desligando) */}
      {tvLigada && tvCharacter && (
        <TvOverlay
          character={tvCharacter}
          phase={phase}
          visitorName={visitorName}
          whatsHref={whatsHref.current}
          onExit={closeTv}
          onTurnedOff={() => setPhase('leaving')}
        />
      )}
    </main>
  )
}
