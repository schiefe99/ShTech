import { createService } from './createService'
import { plansSeed } from '../data/plans.seed'

/** Planos (ofertas): assinatura e projeto sob medida */
export const planService = createService({
  key: 'plans',
  seed: plansSeed,
  version: 2,
})
