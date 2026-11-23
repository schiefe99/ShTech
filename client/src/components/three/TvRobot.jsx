import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * TV ROBOT — o personagem 3D.
 * Hoje é feito de formas simples (placeholder). No Dia 2 trocamos
 * pelo modelo .glb do Spline, mantendo as mesmas props.
 *
 * Props:
 *   character → objeto vindo do service (usa bodyColor e eyeColor)
 *   active    → se é o personagem em destaque (segue o mouse)
 *   ...props  → position, rotation, scale, onClick etc. (repassados ao <group>)
 */
export default function TvRobot({ character, active = true, ...props }) {
  const { bodyColor, eyeColor } = character

  // useRef = "ponteiro" para o objeto 3D, para mexer nele a cada frame
  const head = useRef()

  /**
   * useFrame roda ~60x por segundo (igual requestAnimationFrame).
   * state.pointer = posição do mouse de -1 (esquerda/baixo) a 1 (direita/cima)
   * delta = segundos desde o último frame
   */
  useFrame((state, delta) => {
    const alvoY = active ? state.pointer.x * 0.4 : 0
    const alvoX = active ? -state.pointer.y * 0.25 : 0

    // damp = vai "deslizando" até o alvo em vez de pular (suavização)
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, alvoY, 4, delta)
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, alvoX, 4, delta)
  })

  return (
    <group {...props}>
      {/* Tronco */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.35, 0.9, 1.4, 32]} />
        <meshStandardMaterial color="#cfc6cc" roughness={0.9} />
      </mesh>

      {/* Cabeça (TV) — é ela que gira */}
      <group ref={head}>
        <RoundedBox args={[2.2, 1.7, 1.2]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.35} />
        </RoundedBox>

        {/* Tela */}
        <mesh position={[0, 0.05, 0.61]}>
          <planeGeometry args={[1.8, 1.3]} />
          <meshStandardMaterial color="#05070a" roughness={0.2} />
        </mesh>

        {/* Olhos: [-0.42, 0.42] = posição X de cada um */}
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.62]}>
            <circleGeometry args={[0.26, 48]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={0.8}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
