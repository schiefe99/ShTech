import { useCollection } from './useCollection'
import { characterService } from '../services/characterService'

/**
 * useCharacters — atalho do useCollection para os personagens.
 * Mantém o nome `characters` para quem já usava (Home).
 */
export function useCharacters() {
  const collection = useCollection(characterService)
  return { ...collection, characters: collection.items }
}
