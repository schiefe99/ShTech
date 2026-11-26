import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { screens } from './robot/screenRegistry'

/**
 * CAMERA RIG — move a câmera entre "posição normal" e "dentro da TV".
 *
 * phase (vem da Home):
 *   'idle'    → câmera na posição normal
 *   'zooming' → voando até a tela do robô `targetId`
 *   'on'/'off'→ parada na frente da tela (a TV em HTML está por cima)
 *   'leaving' → voltando para a posição normal
 *
 * onArrive() é chamado quando a câmera CHEGA (fim do zoom ou da volta).
 */
const HOME_POS = new THREE.Vector3(0, -0.2, 7.5) // igual à câmera do Scene
const HOME_LOOK = new THREE.Vector3(0, -0.2, 0)
const SCREEN_DISTANCE = 1.15 // quão perto da tela (menor = tela maior que a janela)
const SPEED = { in: 2.6, out: 3.2 }

export default function CameraRig({ phase, targetId, onArrive }) {
  const look = useRef(HOME_LOOK.clone()) // para onde a câmera olha (suavizado)
  const arrived = useRef(false)
  const lastPhase = useRef(phase)

  // vetores reaproveitados
  const tmp = useRef({
    pos: new THREE.Vector3(),
    center: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
  }).current

  useFrame((state, delta) => {
    const cam = state.camera
    if (lastPhase.current !== phase) {
      lastPhase.current = phase
      arrived.current = false // fase nova → ainda não chegou
    }

    const naTv = phase === 'zooming' || phase === 'on' || phase === 'off'
    const screen = naTv ? screens.get(targetId) : null

    if (screen) {
      // centro da tela + "para fora" da tela (normal) × distância
      screen.getWorldPosition(tmp.center)
      screen.getWorldQuaternion(tmp.quat)
      tmp.normal.set(0, 0, 1).applyQuaternion(tmp.quat)
      tmp.pos.copy(tmp.center).addScaledVector(tmp.normal, SCREEN_DISTANCE)
    } else {
      tmp.pos.copy(HOME_POS)
      tmp.center.copy(HOME_LOOK)
    }

    const speed = naTv ? SPEED.in : SPEED.out
    // damp em cada eixo = aproxima suavemente (rápido no começo, devagar no fim)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tmp.pos.x, speed, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, tmp.pos.y, speed, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, tmp.pos.z, speed, delta)
    look.current.lerp(tmp.center, 1 - Math.exp(-speed * 1.5 * delta))
    cam.lookAt(look.current)

    // chegou? avisa a Home (uma vez só por fase)
    const esperando = phase === 'zooming' || phase === 'leaving'
    if (esperando && !arrived.current && cam.position.distanceTo(tmp.pos) < 0.06) {
      arrived.current = true
      onArrive()
    }
  })

  return null
}
