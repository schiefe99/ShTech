import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * useScreenTexture — desenha a TELA DA TV num <canvas> 2D a cada frame
 * e entrega como textura para o 3D.
 *
 * Por que canvas 2D? Porque é a API que você já conhece do front
 * (ctx.fillRect, ctx.arc, gradientes...). Tudo que você desenhar aqui
 * aparece na tela da TV.
 *
 * Camadas (de trás pra frente):
 *   1. fundo escuro
 *   2. faixa de terminal azul com "código" rolando
 *   3. olhos com brilho + aberração cromática (vermelho/azul deslocados)
 *   4. pupila pontilhada (halftone) seguindo o mouse
 *   5. scanlines (linhas horizontais)
 *   6. chiado (noise) e vinheta nas bordas
 */

// ---------- Configurações (mexa à vontade) ----------
const W = 512 // largura do canvas em pixels
const H = 384 // altura (proporção 4:3, igual TV antiga)

const EYE = {
  y: 0.58, // altura dos olhos (0 = topo, 1 = base)
  gapX: 0.2, // distância de cada olho até o centro (fração da largura)
  radius: 78,
  chroma: 4, // deslocamento da aberração cromática em px
}

const PUPIL = {
  radius: 34,
  dot: 5, // espaçamento da grade de pontinhos
  range: { x: 40, y: 28 }, // quanto a pupila anda com o mouse (px)
}

const BLINK_DURATION = 0.16
const randomDelay = () => 2 + Math.random() * 4

const TERMINAL_LINES = [
  '> init shtech.core --mode=interactive',
  '  loading modules ............ ok',
  '  render.pipeline(webgl) .... ok',
  '> await visitor.say("hello")',
  '  listening on :5173',
  '> deploy --target=your-business',
]

export function useScreenTexture({ eyeColor = '#e8f1ff', active = true }) {
  // useMemo: cria o canvas e a textura UMA vez só
  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return { canvas, ctx, texture }
  }, [])

  // libera memória da GPU quando o componente sai da tela
  useEffect(() => () => texture.dispose(), [texture])

  // estado que muda a cada frame → useRef (não causa render)
  const anim = useRef({
    pupil: { x: 0, y: 0 },
    blink: { timer: 0, next: randomDelay() },
    time: 0,
    power: active ? 1 : 0.25, // brilho da tela: 1 = ativo, 0.25 = "em espera"
    frame: 0,
  })

  useFrame((state, delta) => {
    const a = anim.current
    a.time += delta

    // tela acende/apaga suavemente quando o robô vira o ativo
    a.power = THREE.MathUtils.damp(a.power, active ? 1 : 0.25, 3, delta)

    // PERFORMANCE: robô em espera (tela já apagada) redesenha só
    // 1 a cada 8 frames. Desenhar 4 canvases a 60fps pesa no processador.
    a.frame++
    const emEspera = !active && a.power < 0.27
    if (emEspera && a.frame % 8 !== 0) return

    // ---------- pupila segue o mouse (suavizado) ----------
    const alvoX = active ? state.pointer.x * PUPIL.range.x : 0
    const alvoY = active ? -state.pointer.y * PUPIL.range.y : 0 // canvas: y cresce pra baixo
    a.pupil.x = THREE.MathUtils.damp(a.pupil.x, alvoX, 14, delta)
    a.pupil.y = THREE.MathUtils.damp(a.pupil.y, alvoY, 14, delta)

    // ---------- piscada ----------
    const b = a.blink
    b.timer += delta
    let eyeScaleY = 1
    if (b.timer > b.next) {
      const t = (b.timer - b.next) / BLINK_DURATION
      if (t < 1) eyeScaleY = Math.max(0.05, Math.abs(Math.cos(t * Math.PI)))
      else {
        b.timer = 0
        b.next = randomDelay()
      }
    }

    // ---------- desenho ----------
    drawBackground(ctx)
    drawTerminal(ctx, a.time)

    const cy = H * EYE.y
    for (const side of [-1, 1]) {
      const cx = W / 2 + side * W * EYE.gapX
      drawEye(ctx, cx, cy, eyeColor, eyeScaleY)
      if (eyeScaleY > 0.3) {
        drawPupil(ctx, cx + a.pupil.x, cy + a.pupil.y * eyeScaleY, eyeScaleY)
      }
    }

    drawScanlines(ctx, a.time)
    drawNoise(ctx)
    drawVignette(ctx)
    drawPowerDim(ctx, a.power)

    // avisa o three.js que o canvas mudou
    texture.needsUpdate = true
  })

  return texture
}

// =================== funções de desenho ===================

function drawBackground(ctx) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#04060a'
  ctx.fillRect(0, 0, W, H)
}

function drawTerminal(ctx, time) {
  const bandH = 78
  // faixa azul
  const grad = ctx.createLinearGradient(0, 0, 0, bandH)
  grad.addColorStop(0, '#0b1f6b')
  grad.addColorStop(1, '#071447')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, bandH)

  // texto rolando
  ctx.font = '11px monospace'
  ctx.fillStyle = 'rgba(170, 200, 255, 0.85)'
  const lineH = 13
  const scroll = (time * 8) % lineH
  const firstLine = Math.floor(time * 8 / lineH)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, bandH)
  ctx.clip()
  for (let i = 0; i < 7; i++) {
    const text = TERMINAL_LINES[(firstLine + i) % TERMINAL_LINES.length]
    ctx.fillText(text, 110, 14 + i * lineH - scroll)
  }
  ctx.restore()

  // "cursor" piscando
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = 'rgba(170, 200, 255, 0.9)'
    ctx.fillRect(90, 8, 6, 10)
  }
}

function drawEye(ctx, cx, cy, color, scaleY) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, scaleY) // piscar = achatar no Y

  // 'lighter' soma as cores → vermelho + azul + olho = brilho "estourado"
  ctx.globalCompositeOperation = 'lighter'

  // aberração cromática: cópia vermelha à esquerda, azul à direita
  glowCircle(ctx, -EYE.chroma, 0, EYE.radius, 'rgba(255, 60, 60, 0.55)')
  glowCircle(ctx, EYE.chroma, 0, EYE.radius, 'rgba(60, 120, 255, 0.55)')

  // olho principal: centro branco → cor do personagem → transparente
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, EYE.radius * 1.35)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.55, color)
  g.addColorStop(0.75, hexToRgba(color, 0.35))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, EYE.radius * 1.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function glowCircle(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.1)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 1.1, 0, Math.PI * 2)
  ctx.fill()
}

function drawPupil(ctx, cx, cy, scaleY) {
  // halftone: grade de pontos, maiores no centro e menores na borda
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(10, 12, 20, 0.9)'
  const r = PUPIL.radius
  for (let y = -r; y <= r; y += PUPIL.dot) {
    for (let x = -r; x <= r; x += PUPIL.dot) {
      const dist = Math.hypot(x, y) / r
      if (dist > 1) continue
      const size = (1 - dist) * PUPIL.dot * 0.75 + 0.4
      ctx.beginPath()
      ctx.arc(cx + x, cy + y * scaleY, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawScanlines(ctx, time) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1)

  // faixa clara que desce devagar (o "refresh" das TVs de tubo)
  const bandY = ((time * 60) % (H + 80)) - 40
  const g = ctx.createLinearGradient(0, bandY - 40, 0, bandY + 40)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.04)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, bandY - 40, W, 80)
}

function drawNoise(ctx) {
  ctx.globalCompositeOperation = 'source-over'
  for (let i = 0; i < 500; i++) {
    const v = Math.random() * 255
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.12)`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5)
  }
}

function drawVignette(ctx) {
  ctx.globalCompositeOperation = 'source-over'
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.65)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.75)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// escurece a tela inteira conforme o "power" (robôs inativos)
function drawPowerDim(ctx, power) {
  if (power > 0.99) return
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = `rgba(0, 0, 0, ${(1 - power) * 0.85})`
  ctx.fillRect(0, 0, W, H)
}

// '#7CFFB2' + 0.35 → 'rgba(124, 255, 178, 0.35)'
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}
