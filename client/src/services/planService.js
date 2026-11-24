import { createLocalService } from './createLocalService'
import { plansSeed } from '../data/plans.seed'

/** Planos (ofertas): assinatura e projeto sob medida */
export const planService = createLocalService({
  key: 'plans',
  seed: plansSeed,
  version: 1,
})
