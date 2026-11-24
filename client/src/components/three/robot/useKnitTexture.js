import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * useKnitTexture — gera um NORMAL MAP de tricô canelado num <canvas>.
 *
 * O que é normal map? Uma imagem que "engana" a luz: cada pixel diz
 * para qual lado a superfície aponta. A geometria continua lisa, mas
 * a luz reage como se houvesse relevo (as nervuras do tricô).
 *
 * Cores do normal map: R = inclinação em X, G = inclinação em Y,
 * B = "para fora". (128,128,255) = superfície plana.
 *
 * Padrão: nervuras verticais (canelado) + "pontos" em V em cada fileira.
 */
const SIZE = 256
const RIB_WIDTH = 16 // largura de uma nervura (px)
const ROW_HEIGHT = 8 // altura de uma fileira de pontos (px)

export function useKnitTexture({ repeat = [28, 22] } = {}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    const img = ctx.createImageData(SIZE, SIZE)

    // altura do relevo em cada ponto (0..1)
    const height = (x, y) => {
      const rib = Math.abs(Math.sin((Math.PI * x) / RIB_WIDTH)) // nervura
      const local = (x % RIB_WIDTH) / RIB_WIDTH - 0.5 // -0.5..0.5 dentro da nervura
      const row = ((y + Math.abs(local) * ROW_HEIGHT * 1.2) % ROW_HEIGHT) / ROW_HEIGHT
      const stitch = Math.sin(row * Math.PI) // ponto em "V"
      return rib * (0.55 + 0.45 * stitch)
    }

    const strength = 2.2
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        // derivada = diferença de altura entre vizinhos
        const dx = height(x + 1, y) - height(x - 1, y)
        const dy = height(x, y + 1) - height(x, y - 1)
        const n = new THREE.Vector3(-dx * strength, -dy * strength, 1).normalize()
        const i = (y * SIZE + x) * 4
        img.data[i] = (n.x * 0.5 + 0.5) * 255
        img.data[i + 1] = (n.y * 0.5 + 0.5) * 255
        img.data[i + 2] = (n.z * 0.5 + 0.5) * 255
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping // repete como azulejo
    tex.repeat.set(...repeat)
    tex.anisotropy = 8
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
