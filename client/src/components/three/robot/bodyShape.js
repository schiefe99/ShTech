import * as THREE from 'three'

/**
 * BODY SHAPE — o FORMATO do busto, separado do componente visual.
 *
 * Por que um arquivo só para isso? Duas partes precisam do formato:
 *   - Bust.jsx   → para DESENHAR o corpo
 *   - Cables.jsx → para os fios COLIDIREM com o corpo (não atravessar)
 * Fonte única da verdade: mudou o perfil aqui, os dois acompanham.
 *
 * Um corpo não é "redondo": visto de FRENTE e de LADO tem silhuetas
 * diferentes. Por isso dois perfis:
 *   WIDTH_PROFILE → meia-largura em cada altura (silhueta de frente)
 *   DEPTH_PROFILE → meia-profundidade (silhueta de lado)
 * Em cada altura y, o corte do corpo é uma ELIPSE (largura × profundidade).
 */

// [meia-largura, y] — de baixo para cima
export const WIDTH_PROFILE = [
  [2.35, -7.0], // comprido: a base nunca aparece
  [2.35, -4.0],
  [2.4, -3.0], // braços descendo quase retos
  [2.45, -2.55],
  [2.4, -2.25],
  [2.28, -2.07], // "quina" arredondada do ombro
  [2.02, -1.94],
  [1.55, -1.77], // trapézio: rampa longa até o pescoço
  [1.0, -1.6],
  [0.64, -1.48],
  [0.5, -1.36], // base do pescoço
  [0.46, -1.1],
  [0.45, -0.8], // topo (escondido dentro da TV)
  [0.0, -0.78],
]

// [y, meia-profundidade] — de cima para baixo
export const DEPTH_PROFILE = [
  [-0.78, 0.44],
  [-1.36, 0.46], // pescoço redondo (profundidade ≈ largura)
  [-1.52, 0.62],
  [-1.72, 0.86], // "degrau" do peito
  [-2.05, 0.98],
  [-2.7, 1.04], // peito
  [-3.6, 1.0],
  [-7.0, 0.98],
]

// Gola rolê dobrada: anel mais grosso em volta da base do pescoço
export const COLLAR_PROFILE = [
  [0.5, -1.5],
  [0.57, -1.45],
  [0.59, -1.33],
  [0.56, -1.21],
  [0.49, -1.16],
]

export const BODY_TOP = -0.8 // acima disso é "dentro da TV"
export const BODY_OFFSET_Z = -0.1 // o busto fica um pouco para trás

// ---------- interpolação ----------

const smooth = (t) => t * t * (3 - 2 * t)

export function sampleDepth(y) {
  for (let i = 0; i < DEPTH_PROFILE.length - 1; i++) {
    const [y0, d0] = DEPTH_PROFILE[i]
    const [y1, d1] = DEPTH_PROFILE[i + 1]
    if (y <= y0 && y >= y1) {
      return THREE.MathUtils.lerp(d0, d1, smooth((y - y0) / (y1 - y0)))
    }
  }
  return DEPTH_PROFILE[DEPTH_PROFILE.length - 1][1]
}

export function profileCurve(profile) {
  // SplineCurve liga os pontos com curva suave (sem quinas)
  return new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y)))
}

export function lathe(profile, segments = 96, samples = 140) {
  return new THREE.LatheGeometry(profileCurve(profile).getPoints(samples), segments)
}

// ---------- geometria do corpo ----------

export function buildBodyGeometry() {
  const geometry = lathe(WIDTH_PROFILE)
  const pos = geometry.attributes.position

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const width = Math.hypot(x, z) // raio do torno = largura nessa altura
    if (width < 1e-4) continue // ponto central do topo (escondido)

    const angle = Math.atan2(z, x)
    // nunca mais fundo que largo (pescoço continua redondo)
    let depth = Math.min(sampleDepth(y), width)

    // leve volume extra só na FRENTE do peito
    const front = Math.max(0, Math.sin(angle))
    depth += 0.06 * front * front * Math.exp(-(((y + 2.8) / 0.7) ** 2))

    pos.setXYZ(i, Math.cos(angle) * width, y, Math.sin(angle) * depth)
  }

  geometry.computeVertexNormals()
  return geometry
}

// ---------- colisão (usada pelos fios) ----------

/**
 * Tabela de largura por altura, amostrada da MESMA curva do desenho.
 * Consultar tabela é muito mais rápido do que recalcular a curva.
 */
const TABLE_STEP = 0.02
const WIDTH_TABLE = (() => {
  const pts = profileCurve(WIDTH_PROFILE).getPoints(600)
  const table = []
  for (let y = BODY_TOP; y >= -7; y -= TABLE_STEP) {
    // ponto da curva com y mais próximo
    let best = pts[0]
    for (const p of pts) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p
    table.push(best.x)
  }
  return table
})()

function widthAt(y) {
  const i = Math.round((BODY_TOP - y) / TABLE_STEP)
  return WIDTH_TABLE[THREE.MathUtils.clamp(i, 0, WIDTH_TABLE.length - 1)]
}

/**
 * "Quão dentro" do corpo está o ponto: < 1 = dentro, ≥ 1 = fora.
 * (equação da elipse: (x/largura)² + (z/profundidade)²)
 */
function ellipse(x, y, z, margin) {
  const w = widthAt(y) + margin
  const d = Math.min(sampleDepth(y), widthAt(y)) + margin
  return Math.sqrt((x / w) ** 2 + ((z - BODY_OFFSET_Z) / d) ** 2)
}

/**
 * Se o ponto estiver DENTRO do corpo, empurra para a superfície pelo
 * caminho mais curto: para fora (lados) ou para cima (ombros).
 * Altera o Vector3 recebido. margin = raio do fio.
 * Retorna true se precisou empurrar (o ponto encostou no corpo).
 */
export function pushOutOfBody(p, margin = 0.03) {
  if (p.y > BODY_TOP) return false
  const e = ellipse(p.x, p.y, p.z, margin)
  if (e >= 1) return false

  // opção 1: para fora (escala x/z até a borda da elipse)
  const k = 1 / Math.max(e, 0.05)
  const zc = p.z - BODY_OFFSET_Z
  const distFora = Math.hypot(p.x * (k - 1), zc * (k - 1))

  // opção 2: para cima (sobe até sair do corpo, ex.: em cima do ombro)
  let yCima = p.y
  const limite = Math.min(BODY_TOP, p.y + distFora)
  while (yCima < limite && ellipse(p.x, yCima, p.z, margin) < 1) yCima += 0.03

  if (yCima - p.y < distFora && yCima < BODY_TOP) {
    p.y = yCima
  } else {
    p.x *= k
    p.z = BODY_OFFSET_Z + zc * k
  }
  return true
}
