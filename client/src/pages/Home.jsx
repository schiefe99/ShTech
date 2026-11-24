import { useEffect, useState } from 'react'
import Scene from '../components/three/Scene'
import CharacterCarousel from '../components/three/CharacterCarousel'
import ChatPanel from '../components/chat/ChatPanel'
import { useCharacters } from '../hooks/useCharacters'
import { mod } from '../utils/helpers'

/**
 * HOME — Dia 3: esteira de robôs + conversa.
 *
 * step = "passo" da esteira (inteiro sem limite, ver CharacterCarousel)
 * o personagem ativo é characters[mod(step, total)]
 */
export default function Home() {
  const { characters, loading, error } = useCharacters()
  const [step, setStep] = useState(0)

  // O nome do visitante mora AQUI (e não no ChatPanel) porque a Home
  // não é remontada ao trocar de robô → todos os robôs "lembram" dele
  const [visitorName, setVisitorName] = useState('')

  // Setas do teclado trocam de robô — mas não enquanto digita no input
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setStep((s) => s + 1)
      if (e.key === 'ArrowLeft') setStep((s) => s - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey) // cleanup!
  }, [])

  if (loading) return <p className="p-8">Carregando...</p>
  if (error) return <p className="p-8 text-red-600">Erro: {error}</p>
  if (characters.length === 0) return <p className="p-8">Nenhum personagem cadastrado.</p>

  const activeIndex = mod(step, characters.length)
  const atual = characters[activeIndex]

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-neutral-200 to-neutral-400">
      {/* Camada 3D (fundo) */}
      <div className="absolute inset-0">
        <Scene>
          <group position={[1.0, 0.1, 0]} scale={1.25}>
            <CharacterCarousel characters={characters} step={step} onSelect={setStep} />
          </group>
        </Scene>
      </div>

      {/* Camada HTML (frente). pointer-events-none deixa o mouse
          "atravessar" até o 3D; quem precisa de clique liga de volta */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 md:p-10">
        <header className="flex items-center justify-between">
          <span className="text-2xl font-medium tracking-tight">SHTECH®</span>
          <a href="#contato" className="pointer-events-auto text-xl hover:underline">
            Vamos conversar
          </a>
        </header>

        <section className="pointer-events-auto">
          {/* key: trocar de robô remonta o painel (zera o input) */}
          <ChatPanel
            key={atual.id}
            character={atual}
            visitorName={visitorName}
            onNameChange={setVisitorName}
          />
        </section>

        <footer className="pointer-events-auto flex items-center gap-4">
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
            {String(activeIndex + 1).padStart(2, '0')} / {String(characters.length).padStart(2, '0')}
          </span>
        </footer>
      </div>
    </main>
  )
}
