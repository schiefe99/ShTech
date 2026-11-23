import { useState } from 'react'
import Scene from '../components/three/Scene'
import TvRobot from '../components/three/TvRobot'
import { useCharacters } from '../hooks/useCharacters'

/**
 * HOME — Dia 1: mostra UM robô por vez, lido do service.
 * Os botões trocam o personagem (preparação para a esteira do Dia 3).
 */
export default function Home() {
  const { characters, loading, error } = useCharacters()
  const [index, setIndex] = useState(0)

  if (loading) return <p className="p-8">Carregando...</p>
  if (error) return <p className="p-8 text-red-600">Erro: {error}</p>
  if (characters.length === 0) return <p className="p-8">Nenhum personagem cadastrado.</p>

  const atual = characters[index]

  // % characters.length faz voltar ao início depois do último
  const proximo = () => setIndex((i) => (i + 1) % characters.length)
  const anterior = () => setIndex((i) => (i - 1 + characters.length) % characters.length)

  return (
    <main className="relative h-screen w-full bg-gradient-to-b from-neutral-300 to-neutral-400">
      <Scene>
        {/* key muda → React recria o robô (útil quando trocar de modelo) */}
        <TvRobot key={atual.id} character={atual} position={[1.5, 0.2, 0]} />
      </Scene>

      {/* Camada de HTML por cima do canvas */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8">
        <header className="text-2xl font-medium">SHTECH®</header>

        <div className="pointer-events-auto max-w-sm">
          <p className="text-sm uppercase tracking-widest opacity-60">{atual.role}</p>
          <h1 className="text-5xl font-semibold">{atual.name}</h1>
          <p className="mt-4 text-lg">{atual.lines[0]?.text}</p>

          <div className="mt-6 flex gap-3">
            <button onClick={anterior} className="rounded-full bg-white px-4 py-2 shadow">←</button>
            <button onClick={proximo} className="rounded-full bg-white px-4 py-2 shadow">→</button>
          </div>
        </div>

        <footer className="text-sm opacity-60">
          {index + 1} / {characters.length}
        </footer>
      </div>
    </main>
  )
}
