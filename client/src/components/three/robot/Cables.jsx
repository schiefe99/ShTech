import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Rope, createTubeGeometry, updateTubeGeometry } from './rope'
import { pushOutOfBody } from './bodyShape'

/**
 * CABLES — cabos com física que saem da TV.
 *
 * Cada cabo:
 *   start/startDir → conector na TV e a direção em que o cabo SAI dele
 *                    (coordenadas da TV: acompanha a cabeça)
 *   end            → onde a outra ponta está presa:
 *                      { space: 'tv',   point, dir } → outro conector da TV (laço em U)
 *                      { space: 'body', point, dir } → presa nas costas (some atrás)
 *                      null → ponta SOLTA, com plugue P2 balançando
 *   length         → comprimento (maior que a distância = "barriga")
 *   radius         → espessura
 *
 * Coordenadas da TV (para se localizar):
 *   fones laterais: centro em x = ±1.17, face externa em x ≈ ±1.25
 *   base da TV: y ≈ −0.78 | traseira: z ≈ −0.7
 *
 * A lista descreve o lado DIREITO; cada cabo é espelhado para o esquerdo.
 */
const CABLES = [
  // laço em U: do fone até a base da TV (balança com a cabeça)
  {
    start: [1.25, -0.24, -0.05],
    startDir: [0.5, -1, 0.2],
    end: { space: 'tv', point: [0.72, -0.79, -0.48], dir: [0, 1, 0] },
    length: 1.75,
    radius: 0.02,
  },
  // do fone, passa por cima do ombro e some nas costas
  {
    start: [1.25, -0.04, -0.3],
    startDir: [0.8, -0.5, -0.3],
    end: { space: 'body', point: [1.2, -2.9, -1.1], dir: [0, -1, -0.3] },
    length: 3.1,
    radius: 0.016,
  },
  // ponta solta com plugue, caindo na frente do ombro
  {
    start: [1.25, 0.12, -0.16],
    startDir: [0.9, -0.4, 0.25],
    end: null,
    length: 2.2,
    radius: 0.022,
  },
  // da base da TV até as costas
  {
    start: [0.32, -0.79, -0.3],
    startDir: [0.1, -1, -0.15],
    end: { space: 'body', point: [0.6, -2.6, -1.05], dir: [0, -1, -0.3] },
    length: 2.2,
    radius: 0.015,
  },
]

const POINTS = 26 // pontos da física por cabo
const GRAVITY = -9.8
const WIND = 0.25 // brisa (faz os cabos "respirarem")

// espelha: cada cabo da lista vira dois (direita e esquerda)
const flip = ([x, y, z]) => [-x, y, z]
const ALL_CABLES = CABLES.flatMap((c) => [
  c,
  {
    ...c,
    start: flip(c.start),
    startDir: flip(c.startDir),
    end: c.end && { ...c.end, point: flip(c.end.point), dir: flip(c.end.dir) },
  },
])

// cabo mais grosso perto dos conectores (o "protetor de cabo")
const strainRelief = (u, hasEnd) => {
  const ini = Math.max(0, 1 - u / 0.05)
  const fim = hasEnd ? Math.max(0, 1 - (1 - u) / 0.05) : 0
  return 1 + 0.7 * Math.max(ini, fim)
}

const UP = new THREE.Vector3(0, 1, 0)

export default function Cables({ tvRef, bodyRef }) {
  const cables = useMemo(
    () =>
      ALL_CABLES.map((cfg, i) => ({
        cfg,
        rope: new Rope(POINTS, cfg.length),
        geometry: createTubeGeometry(POINTS, 10),
        phase: i * 1.7, // cada cabo balança num ritmo diferente
        startDir: new THREE.Vector3(),
        endPos: new THREE.Vector3(),
        endDir: new THREE.Vector3(),
      })),
    []
  )

  // refs dos conectores (um no início de cada cabo) e plugues (pontas soltas)
  const connectors = useRef([])
  const plugs = useRef([])

  // vetores/quaternions reaproveitados (nada de "new" dentro do frame)
  const tmp = useRef({
    start: new THREE.Vector3(),
    force: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    qBodyInv: new THREE.Quaternion(),
    qTv: new THREE.Quaternion(),
  }).current

  // ponto da TV → coordenadas do corpo
  const tvPoint = (arr, out) => bodyRef.current.worldToLocal(tvRef.current.localToWorld(out.fromArray(arr)))
  // direção da TV → coordenadas do corpo (só rotação)
  const tvDir = (arr, out) => out.fromArray(arr).normalize().applyQuaternion(tmp.qTv).applyQuaternion(tmp.qBodyInv)

  // posiciona um cilindro (eixo Y) na ponta, apontando para `dir`
  const place = (mesh, at, dir) => {
    if (!mesh) return
    mesh.position.copy(at)
    mesh.quaternion.setFromUnitVectors(UP, dir)
  }

  useFrame((state, delta) => {
    const tv = tvRef.current
    const body = bodyRef.current
    if (!tv || !body) return
    tv.updateWorldMatrix(true, false)
    tv.getWorldQuaternion(tmp.qTv)
    body.getWorldQuaternion(tmp.qBodyInv).invert()

    const t = state.clock.elapsedTime
    const dt = 1 / 60 // passo fixo: física estável mesmo com fps variando
    const passos = Math.min(2, Math.max(1, Math.round(delta / dt)))

    cables.forEach((c, idx) => {
      const { cfg, rope } = c

      // âncoras deste frame
      tvPoint(cfg.start, tmp.start)
      tvDir(cfg.startDir, c.startDir)
      if (cfg.end?.space === 'tv') {
        tvPoint(cfg.end.point, c.endPos)
        tvDir(cfg.end.dir, c.endDir)
      } else if (cfg.end?.space === 'body') {
        c.endPos.fromArray(cfg.end.point)
        c.endDir.fromArray(cfg.end.dir).normalize()
      }

      const opts = {
        start: tmp.start,
        startDir: c.startDir,
        end: cfg.end ? c.endPos : null,
        endDir: cfg.end ? c.endDir : null,
        force: tmp.force,
        collide: pushOutOfBody,
      }

      // primeira vez: estende o cabo e deixa "assentar" (pré-simulação)
      if (!rope.ready) {
        const alvo = cfg.end
          ? c.endPos
          : tmp.dir.copy(tmp.start).addScaledVector(c.startDir, cfg.length)
        rope.layout(tmp.start, alvo)
        tmp.force.set(0, GRAVITY, 0)
        for (let i = 0; i < 240; i++) rope.step(1 / 60, opts)
      }

      // vento suave, diferente para cada cabo
      tmp.force.set(
        Math.sin(t * 0.8 + c.phase) * WIND,
        GRAVITY,
        Math.cos(t * 0.6 + c.phase * 1.3) * WIND
      )
      for (let s = 0; s < passos; s++) rope.step(dt, opts)

      // desenha
      const hasEnd = !!cfg.end
      updateTubeGeometry(c.geometry, rope.pos, (u) => cfg.radius * strainRelief(u, hasEnd))

      // conector no início: cilindro apontando na direção de saída
      place(connectors.current[idx], tmp.start, c.startDir)
      // plugue na ponta solta: alinhado com o último trecho do cabo
      if (!hasEnd) {
        const last = rope.pos[POINTS - 1]
        tmp.dir.subVectors(last, rope.pos[POINTS - 2]).normalize()
        place(plugs.current[idx], last, tmp.dir)
      }
    })
  })

  return (
    <group>
      {cables.map((c, i) => (
        <group key={i}>
          {/* frustumCulled={false}: a malha muda todo frame */}
          <mesh geometry={c.geometry} frustumCulled={false}>
            {/* borracha: escura + clearcoat (verniz) = brilho de cabo de verdade */}
            <meshPhysicalMaterial color="#0c0c0e" roughness={0.4} clearcoat={1} clearcoatRoughness={0.2} />
          </mesh>

          {/* conector na TV */}
          <group ref={(el) => (connectors.current[i] = el)}>
            <mesh position={[0, -0.03, 0]}>
              <cylinderGeometry args={[c.cfg.radius * 2.4, c.cfg.radius * 2.6, 0.1, 16]} />
              <meshStandardMaterial color="#1b1b1f" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>

          {/* plugue P2 na ponta solta: corpo de borracha + ponta metálica */}
          {!c.cfg.end && (
            <group ref={(el) => (plugs.current[i] = el)}>
              <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.035, 0.03, 0.14, 16]} />
                <meshPhysicalMaterial color="#141416" roughness={0.45} clearcoat={0.6} />
              </mesh>
              <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.013, 0.013, 0.09, 12]} />
                <meshStandardMaterial color="#d8d8dc" metalness={1} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.226, 0]}>
                <sphereGeometry args={[0.013, 12, 8]} />
                <meshStandardMaterial color="#d8d8dc" metalness={1} roughness={0.2} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}
