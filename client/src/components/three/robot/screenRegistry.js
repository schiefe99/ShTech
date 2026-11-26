/**
 * REGISTRO DE TELAS — "onde está a tela da TV de cada robô?"
 *
 * Cada CrtTv registra a malha da sua tela aqui, com o id do personagem.
 * O CameraRig pergunta screens.get('luma') e descobre a posição REAL
 * da tela no mundo (já com roda girando, respiração, cabeça virada...).
 *
 * Um Map comum fora do React: não precisa causar render, só guardar.
 */
export const screens = new Map()
