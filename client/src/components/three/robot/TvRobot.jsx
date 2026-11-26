import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CrtTv from './CrtTv'
import Bust from './Bust'
import Cables from './Cables'

/**
 * Cor da blusa a partir da cor dos olhos.
 * Cor neon pura em tecido parece plástico, então misturamos um pouco
 * de cinza (FABRIC_MIX = 0 → cor pura, 1 → cinza total).
 */
const FABRIC_MIX = 0.2
const fabricColor = (hex) =>
  '#' + new THREE.Color(hex).lerp(new THREE.Color('#8f8f8f'), FABRIC_MIX).getHexString()

/**
 * Movimento — ajuste fino aqui:
 *   head  → quanto a CABEÇA gira seguindo o mouse
 *   body  → quanto o CORPO acompanha (fração do giro da cabeça)
 *   lag   → quanto o corpo "atrasa" (menor = mais preguiçoso)
 *   tilt  → inclinação de repouso da cabeça (charme, como na referência)
 */
const MOTION = {
  head: { y: 0.65, x: 0.38 }, // giro máximo (radianos): 0.65 ≈ 37° para os lados
  body: { y: 0.35, z: 0.07 },
  lag: { head: 7, body: 2.8 }, // maior = reage mais rápido
  tilt: -0.06,
  breath: { speed: 1.1, amount: 0.022 },
}

/**
 * TV ROBOT — monta o personagem:
 *
 *   <group>                 ← posição vinda de fora (roda/página)
 *     <group body>          ← CORPO: acompanha a cabeça com atraso + respira
 *       <Bust />
 *       <Cables />          ← fios com física (simulados no espaço do corpo)
 *       <group head>        ← CABEÇA: gira a partir do pescoço
 *         <group tv>        ← (ref usada pelos fios para saber onde a TV está)
 *           <CrtTv />
 */
export default function TvRobot({ character, active = true, focus = false, onEnter, ...props }) {
  const { bodyColor, eyeColor, shirtColor } = character
  const blusa = shirtColor ?? fabricColor(eyeColor)

  const body = useRef()
  const head = useRef()
  const tv = useRef()

  // Sombras: toda malha do robô projeta e recebe sombra
  // (cabo sombreando o ombro, TV sombreando o pescoço...)
  useLayoutEffect(() => {
    body.current.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [])

  // cada robô "respira" num ritmo levemente diferente
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  // TRAVA DO OLHAR: cursor em cima da TV (ou do botão) → a cabeça para,
  // para o botão "ENTRAR NA TV" não fugir do mouse.
  // Duas fontes (a malha da TV e o botão HTML) → travado se QUALQUER uma
  // estiver com o cursor em cima.
  const hover = useRef({ tv: false, button: false })
  const look = useRef({ x: 0, y: 0 }) // último alvo do olhar (fica congelado)
  const setHover = (part, value) => (hover.current[part] = value)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + phase
    const { pointer } = state
    const damp = THREE.MathUtils.damp

    // alvo do olhar: mouse quando ativo; um "olhar distraído" quando não
    // focus = a câmera está entrando na TV → olha RETO para ela
    const travado = active && (hover.current.tv || hover.current.button)
    if (!travado) {
      look.current.x = focus ? 0 : active ? pointer.x : Math.sin(t * 0.25) * 0.25
      look.current.y = focus ? 0 : active ? pointer.y : Math.sin(t * 0.18) * 0.15
    }
    // travado: look mantém o último valor → os damps abaixo "chegam" nele e param
    const lookX = look.current.x
    const lookY = look.current.y

    // CORPO: gira menos e mais devagar que a cabeça (inércia)
    body.current.rotation.y = damp(body.current.rotation.y, lookX * MOTION.head.y * MOTION.body.y, MOTION.lag.body, delta)
    body.current.rotation.z = damp(body.current.rotation.z, -lookX * MOTION.body.z, MOTION.lag.body, delta)
    // respiração: sobe/desce de leve
    body.current.position.y = Math.sin(t * MOTION.breath.speed) * MOTION.breath.amount

    // CABEÇA: completa o giro (relativo ao corpo, que já girou um pouco)
    head.current.rotation.y = damp(head.current.rotation.y, lookX * MOTION.head.y * (1 - MOTION.body.y), MOTION.lag.head, delta)
    head.current.rotation.x = damp(head.current.rotation.x, -lookY * MOTION.head.x, MOTION.lag.head, delta)
    head.current.rotation.z = damp(
      head.current.rotation.z,
      focus ? 0 : MOTION.tilt + Math.sin(t * 0.6) * 0.015,
      MOTION.lag.head,
      delta
    )
  })

  return (
    <group {...props}>
      <group ref={body}>
        <Bust color={blusa} />
        <Cables tvRef={tv} bodyRef={body} />

        {/* pivô no pescoço: a cabeça gira a partir da base, não do centro */}
        <group position={[0, -0.75, 0]}>
          <group ref={head}>
            {/* eventos do R3F: o raio do mouse acertou alguma malha da TV */}
            <group
              ref={tv}
              position={[0, 0.75, 0]}
              onPointerOver={() => setHover('tv', true)}
              onPointerOut={() => setHover('tv', false)}
            >
              <CrtTv
                id={character.id}
                frameColor={bodyColor}
                eyeColor={eyeColor}
                active={active}
                onEnter={onEnter}
                onButtonHover={(v) => setHover('button', v)}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
