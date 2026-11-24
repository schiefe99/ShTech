import { useCollection } from './useCollection'
import { planService } from '../services/planService'

/** Todos os planos (assinatura, projeto...) */
export function usePlans() {
  const collection = useCollection(planService)
  return { ...collection, plans: collection.items }
}
