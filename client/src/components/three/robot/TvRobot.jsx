import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CrtTv from './CrtTv'
import Bust from './Bust'
import Cables from './Cables'

/**
 * TV ROBOT — monta o personagem juntando as peças:
 *
 *   <group>             ← posição/escala vindas de fora (props)
 *     <Bust />          ← corpo (parado)
 *     <Cables />        ← fios (parados, presos ao corpo)
 *     <group head>      ← cabeça: gira seguindo o mouse
 *       <CrtTv />
 *
 * Props:
 *   character → { bodyColor, eyeColor } vindo do service
 *   active    → se é o personagem em destaque
 */
export default function TvRobot({ character, active = true, ...props }) {
  const { bodyColor, eyeColor } = character
  const head = useRef()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Movimento sutil: segue o mouse + "respiração" (seno lento)
    const alvoY = active ? state.pointer.x * 0.3 : 0
    const alvoX = active ? -state.pointer.y * 0.15 : 0
    const respiracao = Math.sin(t * 1.2) * 0.015

    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, alvoY, 3, delta)
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, alvoX, 3, delta)
    head.current.position.y = respiracao
  })

  return (
    <group {...props}>
      <Bust />
      <Cables />

      {/* Rotação a partir da base da cabeça (pescoço), não do centro */}
      <group position={[0, -0.75, 0]}>
        <group ref={head}>
          <group position={[0, 0.75, 0]}>
            <CrtTv frameColor={bodyColor} eyeColor={eyeColor} active={active} />
          </group>
        </group>
      </group>
    </group>
  )
}
