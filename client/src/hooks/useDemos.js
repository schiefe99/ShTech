import { useCollection } from './useCollection'
import { demoService } from '../services/demoService'

/** Demos de um personagem (ou todas, se characterId vier vazio) */
export function useDemos(characterId) {
  const collection = useCollection(demoService, characterId ? { characterId } : undefined)
  return { ...collection, demos: collection.items }
}
