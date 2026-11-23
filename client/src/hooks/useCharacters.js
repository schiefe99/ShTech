import { useCallback, useEffect, useState } from 'react'
import { characterService } from '../services/characterService'

/**
 * HOOK useCharacters — a ponte entre o service e o React.
 *
 * O componente não chama o service direto; ele usa este hook e recebe:
 *   characters → a lista
 *   loading    → true enquanto carrega
 *   error      → mensagem se algo der errado
 *   create / update / remove → fazem a operação E recarregam a lista
 *
 * Exemplo de uso:
 *   const { characters, loading } = useCharacters()
 */
export function useCharacters() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useCallback: a função mantém a mesma referência entre renders
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setCharacters(await characterService.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carrega uma vez quando o componente aparece na tela
  useEffect(() => {
    load()
  }, [load])

  // Cada ação: executa no service e recarrega a lista
  const create = async (data) => {
    const novo = await characterService.create(data)
    await load()
    return novo
  }

  const update = async (id, patch) => {
    const atualizado = await characterService.update(id, patch)
    await load()
    return atualizado
  }

  const remove = async (id) => {
    await characterService.remove(id)
    await load()
  }

  return { characters, loading, error, reload: load, create, update, remove }
}
