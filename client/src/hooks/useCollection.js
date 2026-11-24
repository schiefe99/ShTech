import { useCallback, useEffect, useState } from 'react'

/**
 * useCollection — hook GENÉRICO que liga qualquer service ao React.
 *
 *   const { items, loading } = useCollection(demoService, { characterId: 'luma' })
 *
 * É o par da fábrica de services: um CRUD genérico + um hook genérico.
 * useCharacters, useDemos e usePlans são só "atalhos" em cima dele.
 */
export function useCollection(service, filter) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Objeto `filter` é recriado a cada render → comparamos pelo texto
  // (JSON) para não recarregar em loop
  const filterKey = JSON.stringify(filter ?? {})

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setItems(await service.list(JSON.parse(filterKey)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [service, filterKey])

  useEffect(() => {
    load()
  }, [load])

  // Cada ação executa no service e recarrega a lista
  const create = async (data) => {
    const novo = await service.create(data)
    await load()
    return novo
  }
  const update = async (id, patch) => {
    const atualizado = await service.update(id, patch)
    await load()
    return atualizado
  }
  const remove = async (id) => {
    await service.remove(id)
    await load()
  }

  return { items, loading, error, reload: load, create, update, remove }
}
