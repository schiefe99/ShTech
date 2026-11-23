import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'

/**
 * SCENE — o "palco" 3D: câmera, luzes, ambiente e sombra.
 * Tudo que for 3D entra como children.
 *
 *   <Scene>
 *     <TvRobot ... />
 *   </Scene>
 */
export default function Scene({ children }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7], fov: 40 }} // [x, y, z] da câmera
      dpr={[1, 2]} // resolução: 1x a 2x conforme a tela
    >
      {/* Luz geral fraca + uma luz direcional (tipo sol) */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />

      {/* Reflexos realistas no metal */}
      <Environment preset="studio" />

      {children}

      {/* Sombra suave no "chão" */}
      <ContactShadows position={[0, -2.1, 0]} opacity={0.35} blur={2.5} scale={10} />
    </Canvas>
  )
}
