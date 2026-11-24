import * as THREE from 'three'

/**
 * ROPE — física de corda (Verlet), a mesma técnica de jogos para
 * cabelo, cordas e cabos.
 *
 * A corda é uma fileira de PONTOS. A cada passo:
 *   1. INÉRCIA + FORÇAS: cada ponto continua o movimento que vinha
 *      fazendo (posição atual − anterior) e sofre gravidade/vento.
 *   2. RESTRIÇÕES (repetidas): vizinhos voltam à distância certa
 *      → a corda não estica. Pontas presas ficam no lugar.
 *   3. RIGIDEZ: pontos a 2 de distância também se "empurram" de leve
 *      → o cabo faz curvas suaves em vez de dobrar em quinas.
 *   4. DIREÇÃO DE SAÍDA: o 2º ponto fica alinhado com o conector
 *      → o cabo sai reto do plugue e só depois curva (como na vida real).
 *   5. COLISÃO + ATRITO: pontos dentro do corpo são empurrados para
 *      fora e perdem velocidade (senão escorregam do ombro).
 */
export class Rope {
  constructor(count, length) {
    this.count = count
    this.segment = length / (count - 1)
    this.pos = Array.from({ length: count }, () => new THREE.Vector3())
    this.prev = Array.from({ length: count }, () => new THREE.Vector3())
    this.ready = false
  }

  /** posiciona a corda entre `from` e `to` (ou na direção dir) antes de simular */
  layout(from, to) {
    for (let i = 0; i < this.count; i++) {
      this.pos[i].lerpVectors(from, to, i / (this.count - 1))
      this.prev[i].copy(this.pos[i])
    }
    this.ready = true
  }

  step(dt, opts) {
    const {
      start, // Vector3: ponta presa no início
      startDir, // Vector3 normalizado: direção em que o cabo sai do conector
      end = null, // Vector3 ou null (ponta solta)
      endDir = null, // direção em que o cabo ENTRA no conector final
      force,
      damping = 0.982,
      iterations = 14,
      stiffness = 0.12,
      friction = 0.85,
      collide,
    } = opts

    const last = this.count - 1
    const tmp = _a
    const dt2 = dt * dt

    // 1. inércia + forças (pontas presas não se movem)
    for (let i = 1; i <= last; i++) {
      if (i === last && end) continue
      const p = this.pos[i]
      tmp.subVectors(p, this.prev[i]).multiplyScalar(damping)
      this.prev[i].copy(p)
      p.add(tmp).addScaledVector(force, dt2)
    }

    for (let k = 0; k < iterations; k++) {
      // pontas presas + direção de saída/entrada
      this.pos[0].copy(start)
      if (startDir) this.pos[1].copy(start).addScaledVector(startDir, this.segment)
      if (end) {
        this.pos[last].copy(end)
        if (endDir) this.pos[last - 1].copy(end).addScaledVector(endDir, -this.segment)
      }

      // 2. distância entre vizinhos
      for (let i = 0; i < last; i++) this.solve(i, i + 1, this.segment, 1, !!end, !!startDir, !!endDir)

      // 3. rigidez: distância entre pontos i e i+2
      if (stiffness > 0) {
        for (let i = 0; i < last - 1; i++) {
          this.solve(i, i + 2, this.segment * 1.9, stiffness, !!end, !!startDir, !!endDir)
        }
      }

      // 5. colisão + atrito (a cada 3 iterações, para economizar)
      if (collide && (k % 3 === 2 || k === iterations - 1)) {
        for (let i = 2; i <= last; i++) {
          if (i >= last - 1 && end) continue
          if (collide(this.pos[i])) this.prev[i].lerp(this.pos[i], friction)
        }
      }
    }
  }

  // aproxima/afasta os pontos a e b até a distância `rest`
  solve(a, b, rest, strength, hasEnd, pinStartDir, pinEndDir) {
    const last = this.count - 1
    const locked = (i) =>
      i === 0 || (pinStartDir && i === 1) || (hasEnd && (i === last || (pinEndDir && i === last - 1)))
    const la = locked(a)
    const lb = locked(b)
    if (la && lb) return

    const pa = this.pos[a]
    const pb = this.pos[b]
    _a.subVectors(pb, pa)
    const dist = _a.length() || 1e-6
    let erro = ((dist - rest) / dist) * strength
    // rigidez só EMPURRA (evita dobra), não puxa (senão a corda fica dura)
    if (strength < 1 && dist > rest) return

    if (la) pb.addScaledVector(_a, -erro)
    else if (lb) pa.addScaledVector(_a, erro)
    else {
      erro *= 0.5
      pa.addScaledVector(_a, erro)
      pb.addScaledVector(_a, -erro)
    }
  }
}

const _a = new THREE.Vector3()

// ======================================================================
// TUBO ATUALIZÁVEL — a malha do cabo, reescrita a cada frame.
// ======================================================================

/**
 * SUBDIV: entre dois pontos da corda criamos pontos intermediários
 * numa curva Catmull-Rom (curva suave que passa POR todos os pontos).
 * Assim a física usa poucos pontos (barato) e o desenho fica liso.
 */
export const SUBDIV = 4

export function createTubeGeometry(ropePoints, radial = 10) {
  const count = (ropePoints - 1) * SUBDIV + 1
  const ring = radial + 1
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * ring * 3), 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * ring * 3), 3))

  const index = []
  for (let i = 0; i < count - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j
      const b = (i + 1) * ring + j
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  geo.setIndex(index)
  geo.userData = {
    radial,
    count,
    smooth: Array.from({ length: count }, () => new THREE.Vector3()),
  }
  return geo
}

// Catmull-Rom uniforme entre p1 e p2 (p0 e p3 são os vizinhos)
function catmull(out, p0, p1, p2, p3, t) {
  const t2 = t * t
  const t3 = t2 * t
  for (const c of ['x', 'y', 'z']) {
    out[c] =
      0.5 *
      (2 * p1[c] +
        (-p0[c] + p2[c]) * t +
        (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 +
        (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)
  }
  return out
}

const _t = new THREE.Vector3()
const _n = new THREE.Vector3()
const _b = new THREE.Vector3()
const _d = new THREE.Vector3()

/**
 * radiusAt(u) → raio do cabo em u (0 = início, 1 = fim).
 * Permite engrossar perto do conector (protetor de cabo).
 */
export function updateTubeGeometry(geo, points, radiusAt) {
  const { radial, count, smooth } = geo.userData
  const n = points.length

  // 1. pontos suavizados
  let k = 0
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, n - 1)]
    for (let s = 0; s < SUBDIV; s++) catmull(smooth[k++], p0, p1, p2, p3, s / SUBDIV)
  }
  smooth[k].copy(points[n - 1])

  // 2. anéis ao longo da curva, com "transporte paralelo":
  //    cada anel herda a orientação do anterior e só corrige o mínimo
  //    → o tubo não "torce" (sem listras de sombra girando)
  const pos = geo.attributes.position.array
  const nor = geo.attributes.normal.array
  let o = 0

  for (let i = 0; i < count; i++) {
    _t.subVectors(smooth[Math.min(i + 1, count - 1)], smooth[Math.max(i - 1, 0)]).normalize()
    if (i === 0) {
      _n.set(0, 1, 0)
      if (Math.abs(_t.y) > 0.9) _n.set(1, 0, 0)
    }
    // remove de N a parte paralela à tangente (fica perpendicular)
    _n.addScaledVector(_t, -_n.dot(_t)).normalize()
    _b.crossVectors(_t, _n)

    const r = radiusAt(i / (count - 1))
    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2
      _d.copy(_n).multiplyScalar(Math.cos(ang)).addScaledVector(_b, Math.sin(ang))
      pos[o] = smooth[i].x + _d.x * r
      pos[o + 1] = smooth[i].y + _d.y * r
      pos[o + 2] = smooth[i].z + _d.z * r
      nor[o] = _d.x
      nor[o + 1] = _d.y
      nor[o + 2] = _d.z
      o += 3
    }
  }
  geo.attributes.position.needsUpdate = true
  geo.attributes.normal.needsUpdate = true
}
