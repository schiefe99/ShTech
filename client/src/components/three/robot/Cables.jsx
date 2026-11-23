import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * CABLES — fios que saem da TV e caem sobre os ombros.
 *
 * Técnica: cada fio é uma CURVA (CatmullRomCurve3) que passa por
 * alguns pontos [x, y, z]; TubeGeometry "veste" a curva com um tubo.
 * Para criar um fio novo, é só adicionar uma lista de pontos.
 */
const CABLES = [
  // [início no fone] → [curva pra fora] → [desce] → [apoia no ombro]
  // lado esquerdo
  [[-1.2, -0.3, -0.15], [-1.4, -0.75, 0.05], [-1.3, -1.35, 0.25], [-1.05, -1.68, 0.3]],
  [[-1.15, -0.25, -0.3], [-1.55, -0.6, -0.15], [-1.6, -1.35, 0.05], [-1.45, -1.86, 0.1]],
  [[-1.0, -0.55, -0.35], [-1.05, -0.95, -0.05], [-0.85, -1.4, 0.2], [-0.7, -1.58, 0.25]],
  // lado direito
  [[1.2, -0.3, -0.15], [1.38, -0.8, 0.08], [1.25, -1.38, 0.25], [1.0, -1.67, 0.3]],
  [[1.15, -0.25, -0.3], [1.6, -0.65, -0.1], [1.65, -1.4, 0.05], [1.5, -1.88, 0.1]],
  [[1.0, -0.55, -0.35], [1.1, -1.0, -0.05], [0.9, -1.42, 0.2], [0.72, -1.59, 0.25]],
]

export default function Cables({ color = '#0c0c0e' }) {
  const geometries = useMemo(
    () =>
      CABLES.map((points) => {
        const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
        // (curva, segmentos ao longo, raio do fio, lados do tubo, fechado?)
        return new THREE.TubeGeometry(curve, 48, 0.018, 8, false)
      }),
    []
  )

  return (
    <group>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
