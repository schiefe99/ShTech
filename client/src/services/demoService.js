import { createService } from './createService'
import { demosSeed } from '../data/demos.seed'

/** Demos (layouts de exemplo), ligadas a um personagem por characterId */
export const demoService = createService({
  key: 'demos',
  seed: demosSeed,
  version: 4,
})
