import { createLocalService } from './createLocalService'
import { charactersSeed } from '../data/characters.seed'

/**
 * Personagens (robôs). Toda a lógica de CRUD vem da fábrica.
 * version 2: o seed ganhou tagline, intro e benefits (página do serviço).
 * version 3: o link do WhatsApp do LUMA passou a usar o número do config.js.
 */
export const characterService = createLocalService({
  key: 'characters',
  seed: charactersSeed,
  version: 3,
})
