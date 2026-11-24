import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import TvRobot from './robot/TvRobot'
import { mod } from '../../utils/helpers'

/**
 * CHARACTER CAROUSEL — a RODA de seleção de personagem.
 *
 * Os robôs ficam em um círculo (vista de cima):
 *
 *            [fundo]
 *     [esq]     ●      [dir]      ● = centro da roda
 *            [ATIVO]   ← câmera aqui na frente
 *
 * A cada frame calculamos onde cada robô está na roda:
 *   rel = ângulo do robô em relação à frente (0 = ativo, π = fundo)
 *   x   = sin(rel) · raio           → esquerda/direita
 *   z   = cos(rel) · raio − raio    → frente/fundo
 *   y   = sobe conforme vai pro fundo (para não sumir atrás do ativo)
 *
 * `step` não tem limite (-3, 7, 12...): ir do último para o primeiro
 * é só +1 passo, sem a roda dar uma volta inteira para trás.
 */
const WHEEL = {
  radius: 6.5,
  lift: 2.4, // quanto o robô do fundo fica mais alto que o ativo
  speed: 3, // suavidade do giro (maior = mais rápido)
  face: 0, // 0 = todos olham para a câmera; 1 = olha para fora da roda
  shrink: 0.35, // quanto o robô do fundo encolhe (0 = nada, 0.35 = 35%)
  leftSpread: 0.7, // lado ESQUERDO mais perto do centro (1 = simétrico)
}

// leva qualquer ângulo para o intervalo -π..π
const wrapAngle = (a) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2))

export default function CharacterCarousel({ characters, step, onSelect }) {
  const total = characters.length
  const angleStep = (Math.PI * 2) / total
  const activeIndex = mod(step, total)

  const progress = useRef(step) // acompanha `step` suavemente
  const slots = useRef([]) // um <group> por robô (callback ref)

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, step, WHEEL.speed, delta)

    slots.current.forEach((slot, i) => {
      if (!slot) return
      // ângulo do robô na roda, NORMALIZADO para -π..π (-180°..180°).
      // Sem isso, depois de uma volta completa rel vira -2π (-360°):
      // a posição fica igual (seno/cosseno repetem), mas a rotação
      // rel × face = -180° → o robô aparece DE COSTAS.
      const rel = wrapAngle((i - progress.current) * angleStep)
      const depth = (1 - Math.cos(rel)) / 2 // 0 na frente, 1 no fundo

      // lado esquerdo (sin < 0) "encolhe" em x → robô vem mais para a direita
      const side = Math.sin(rel)
      const spread = side < 0 ? WHEEL.leftSpread : 1

      slot.position.set(
        side * WHEEL.radius * spread,
        depth * WHEEL.lift,
        Math.cos(rel) * WHEEL.radius - WHEEL.radius
      )
      slot.rotation.y = rel * WHEEL.face // meio caminho entre "fora da roda" e a câmera
      slot.scale.setScalar(1 - depth * WHEEL.shrink) // fundo = menor
    })
  })

  // clicou num robô: gira pelo caminho mais curto até ele
  function selectByIndex(i) {
    let diff = i - activeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    onSelect(step + diff)
  }

  return (
    <group>
      {characters.map((character, i) => (
        <group key={character.id} ref={(el) => (slots.current[i] = el)}>
          <TvRobot
            character={character}
            active={i === activeIndex}
            onClick={(e) => {
              e.stopPropagation() // só o robô mais da frente recebe o clique
              selectByIndex(i)
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'default')}
          />
        </group>
      ))}
    </group>
  )
}
