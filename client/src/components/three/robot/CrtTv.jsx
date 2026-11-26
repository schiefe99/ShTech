import { useEffect, useMemo } from 'react'
import { RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useScreenTexture } from './useScreenTexture'
import { screens } from './screenRegistry'

/**
 * CRT TV — a cabeça do robô.
 *
 * Peças (de fora pra dentro, olhando de frente):
 *   moldura prateada → borda preta → tela curva com a textura animada
 *   + caixa traseira (o "tubo"), fones laterais e LEDs
 *
 * Medidas em unidades do three.js (pense como "metros").
 */
const SCREEN = { w: 1.72, h: 1.29, bulge: 0.06 }

export default function CrtTv({ id, frameColor = '#c4c4c4', eyeColor, active, onEnter, onButtonHover }) {
  const texture = useScreenTexture({ eyeColor, active })

  // botão sumiu (ex.: clicou e entrou na TV) com o cursor em cima →
  // o "pointerleave" nunca dispara; avisamos manualmente que saiu
  useEffect(() => {
    if (!onEnter) onButtonHover?.(false)
  }, [onEnter, onButtonHover])

  // Tela levemente abaulada, como vidro de TV de tubo:
  // empurra cada vértice no eixo Z, mais no centro e menos nas bordas
  const screenGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(SCREEN.w, SCREEN.h, 32, 24)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const nx = pos.getX(i) / (SCREEN.w / 2) // -1..1
      const ny = pos.getY(i) / (SCREEN.h / 2) // -1..1
      pos.setZ(i, SCREEN.bulge * (1 - nx * nx) * (1 - ny * ny))
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group>
      {/* Moldura externa (cor do personagem) */}
      <RoundedBox args={[2.3, 1.82, 0.32]} radius={0.1} smoothness={5} position={[0, 0, 0.42]}>
        <meshStandardMaterial color={frameColor} metalness={0.85} roughness={0.25} />
      </RoundedBox>

      {/* Borda preta em volta da tela */}
      <RoundedBox args={[2.04, 1.58, 0.1]} radius={0.06} smoothness={4} position={[0, 0, 0.56]}>
        <meshStandardMaterial color="#0d0d0f" metalness={0.3} roughness={0.5} />
      </RoundedBox>

      {/* Tela: meshBasicMaterial não reage à luz (a tela "emite" luz)
          toneMapped={false} deixa o branco passar de 1 → o Bloom pega */}
      {/* ref de função: registra a tela (para a câmera achar) e remove ao sair */}
      <mesh
        geometry={screenGeometry}
        position={[0, 0.06, 0.615]}
        ref={(mesh) => (mesh ? screens.set(id, mesh) : screens.delete(id))}
      >
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Reflexo sutil no vidro */}
      <mesh geometry={screenGeometry} position={[0, 0.06, 0.62]}>
        <meshPhysicalMaterial
          transparent
          opacity={0.06}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          color="#000000"
        />
      </mesh>

      {/* Caixa traseira (o tubo) */}
      <RoundedBox args={[1.95, 1.55, 1.05]} radius={0.18} smoothness={4} position={[0, 0, -0.2]}>
        <meshStandardMaterial color="#1a1a1d" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* Botão "ENTRAR NA TV" impresso na moldura, à esquerda dos LEDs.
          <Html transform> prende um elemento HTML neste ponto do 3D:
          ele gira/inclina junto com a TV (parece parte do aparelho).
          Só aparece no robô ativo (quando a Home passa onEnter). */}
      {onEnter && (
        <Html transform position={[-0.05, -0.712, 0.62]} scale={0.1} zIndexRange={[10, 0]}>
          <button
            onClick={onEnter}
            onPointerEnter={() => onButtonHover?.(true)}
            onPointerLeave={() => onButtonHover?.(false)}
            className="tv-enter-btn"
            style={{ '--tv-accent': eyeColor }}
          >
            <span className="tv-enter-dot" />
            ENTRAR NA TV
          </button>
        </Html>
      )}

      {/* LEDs: o primeiro aceso */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0.22 + i * 0.11, -0.71, 0.615]}>
          <capsuleGeometry args={[0.012, 0.035, 4, 8]} />
          <meshBasicMaterial
            color={i === 0 ? '#5b8cff' : '#2a2a30'}
            toneMapped={i !== 0}
          />
        </mesh>
      ))}

      {/* Fones / conectores laterais */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.17, -0.05, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
            <meshStandardMaterial color="#1c1c1f" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, side * 0.09, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.05, 32]} />
            <meshStandardMaterial color="#2b2b30" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
