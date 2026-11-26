import { createService } from './createService'
import { charactersSeed } from '../data/characters.seed'

/**
 * Personagens (robôs). Toda a lógica de CRUD vem da fábrica.
 * version 2: o seed ganhou tagline, intro e benefits (página do serviço).
 * version 3: o link do WhatsApp do LUMA passou a usar o número do config.js.
 * version 4: personagens ganharam `process` (etapas do "Como funciona").
 */
export const characterService = createService({
  key: 'characters',
  seed: charactersSeed,
  version: 4,
})
