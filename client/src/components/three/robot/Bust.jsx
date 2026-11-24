import { useMemo } from 'react'
import * as THREE from 'three'
import { useKnitTexture } from './useKnitTexture'
import { buildBodyGeometry, lathe, COLLAR_PROFILE, BODY_OFFSET_Z } from './bodyShape'

/**
 * BUST — tronco humano com blusa de gola rolê (tricô).
 * O FORMATO vem de bodyShape.js (compartilhado com os fios);
 * aqui fica só a parte visual: malha + material de tecido.
 */
export default function Bust({ color = '#cbbcc6' }) {
  const knit = useKnitTexture()
  const knitCollar = useKnitTexture({ repeat: [28, 4] })

  const body = useMemo(buildBodyGeometry, [])
  const collar = useMemo(() => lathe(COLLAR_PROFILE, 96, 30), [])

  // brilho do tecido = a própria cor, mais clara (senão fica "lavado" de branco)
  const sheenColor = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.5),
    [color]
  )

  const fabric = {
    color,
    roughness: 0.95,
    sheen: 1, // brilho aveludado de tecido
    sheenColor,
    sheenRoughness: 0.5,
    normalScale: new THREE.Vector2(0.9, 0.9),
  }

  return (
    <group position={[0, 0, BODY_OFFSET_Z]}>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...fabric} normalMap={knit} />
      </mesh>
      <mesh geometry={collar}>
        <meshPhysicalMaterial {...fabric} normalMap={knitCollar} />
      </mesh>
    </group>
  )
}
