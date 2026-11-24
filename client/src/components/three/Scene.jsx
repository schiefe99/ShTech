import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

/**
 * SCENE — o "palco" 3D: câmera, luzes, ambiente e pós-processamento.
 *
 * Pós-processamento = filtros aplicados na imagem FINAL (tipo Instagram):
 *   Bloom    → o que é muito claro "vaza" luz (o brilho dos olhos)
 *   Noise    → granulado de filme
 *   Vignette → escurece os cantos
 */
export default function Scene({ children, fog = true, background = null }) {
  return (
    <Canvas
      shadows // liga o sistema de sombras do three.js
      camera={{ position: [0, -0.2, 7.5], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      {/* Névoa: objetos longe da câmera somem no cinza do fundo
          (args = [cor, começa em, some totalmente em]) */}
      {fog && <fog attach="fog" args={['#cfcfcf', 9, 19]} />}

      {/* Fundo sólido opcional: em página escura, use a MESMA cor da
          página para o canvas "sumir" (sem retângulo em volta) */}
      {background && <color attach="background" args={[background]} />}

      {/* Iluminação de estúdio: luz principal + contraluz + preenchimento */}
      <ambientLight intensity={0.15} />
      {/* Luz principal PROJETA SOMBRA (cabos e TV sombreando o blusão).
          shadow-camera-*: área coberta pela sombra (em volta do robô ativo)
          shadow-normalBias: evita "listras" de sombra na própria superfície */}
      <directionalLight
        position={[-3, 4, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[4, 2, -3]} intensity={0.8} color="#dfe6ff" />
      {/* Reflexos de estúdio gerados localmente (sem baixar arquivo .hdr):
          cada Lightformer é um "painel de luz" que o metal reflete */}
      <Environment resolution={256} environmentIntensity={0.55}>
        <Lightformer intensity={2} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={1} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={0.6} position={[0, -3, 4]} scale={[8, 1, 1]} />
      </Environment>

      {children}

      <EffectComposer>
        {/* luminanceThreshold: só o que passa desse brilho ganha bloom */}
        <Bloom intensity={1.1} luminanceThreshold={0.75} luminanceSmoothing={0.2} mipmapBlur />
        <Noise opacity={0.035} />
        <Vignette offset={0.3} darkness={0.45} />
      </EffectComposer>
    </Canvas>
  )
}
