import { useEffect, useRef } from 'react'

/**
 * CHIADO de TV (estática) — aparece entre um canal e outro.
 *
 * Truque de performance: o canvas é PEQUENO (160×90) e o CSS estica
 * para a tela toda com `image-rendering: pixelated` → pixels grandes,
 * cara de TV antiga, e quase nenhum custo para desenhar.
 */
export default function StaticNoise({ opacity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = ctx.createImageData(canvas.width, canvas.height)
    let frame

    function draw() {
      // cada pixel recebe um cinza aleatório
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame) // para o loop ao sair
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={90}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ imageRendering: 'pixelated', opacity }}
    />
  )
}
