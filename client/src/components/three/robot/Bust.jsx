import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * BUST — pescoço + ombros com gola alta (blusa de tricô).
 *
 * Técnica: LatheGeometry ("torno"). Você desenha METADE do perfil
 * (uma lista de pontos [raio, altura]) e o three.js gira em volta
 * do eixo Y, como um vaso no torno de cerâmica.
 * Depois achatamos no Z (scale) para o tronco não ficar redondo.
 */
const PROFILE = [
  // [raio, y]  — de baixo para cima
  [2.25, -3.9],
  [2.2, -2.9],
  [2.05, -2.25],
  [1.7, -1.88], // ombro
  [1.15, -1.64],
  [0.58, -1.5], // base da gola
  [0.47, -1.32],
  [0.43, -1.0],
  [0.46, -0.8], // borda da gola
  [0.0, -0.79],
]

export default function Bust({ color = '#cdbfc9' }) {
  const geometry = useMemo(() => {
    // SplineCurve liga os pontos com uma curva suave (sem "quinas");
    // getPoints(80) devolve 80 pontos ao longo dessa curva
    const curve = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)))
    return new THREE.LatheGeometry(curve.getPoints(80), 96)
  }, [])

  return (
    <mesh geometry={geometry} scale={[1, 1, 0.58]} position={[0, 0, -0.1]}>
      {/* roughness 1 + sheen = aspecto de tecido */}
      <meshPhysicalMaterial color={color} roughness={1} sheen={1} sheenColor="#ffffff" sheenRoughness={0.6} />
    </mesh>
  )
}
