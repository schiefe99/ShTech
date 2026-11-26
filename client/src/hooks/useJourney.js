import { useEffect, useState } from 'react'

/**
 * JORNADA — as escolhas do visitante dentro da TV de um robô:
 *
 *   business   { name, city }   digitados no canal Layouts
 *   layout     { id, title }    layout escolhido
 *   processOk  true/false       passou pelo "Como funciona"
 *   plan       { id, name }     plano escolhido
 *
 * Fica salva no localStorage (uma por robô): se o visitante recarregar
 * a página ou voltar amanhã, as escolhas continuam lá.
 *
 * O try/catch existe porque o localStorage pode falhar (aba anônima de
 * alguns navegadores, armazenamento cheio). Se falhar, a jornada só
 * não é salva; o site continua funcionando.
 */
const EMPTY = { business: { name: '', city: '' }, layout: null, processOk: false, plan: null }
const storageKey = (characterId) => `shtech:jornada:${characterId}`

function read(characterId) {
  try {
    const salvo = JSON.parse(localStorage.getItem(storageKey(characterId)))
    return salvo ? { ...EMPTY, ...salvo } : EMPTY
  } catch {
    return EMPTY
  }
}

export function useJourney(characterId) {
  // função no useState = lê o localStorage só na 1ª renderização
  const [journey, setJourney] = useState(() => read(characterId))

  // toda mudança é salva
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(characterId), JSON.stringify(journey))
    } catch {
      /* sem armazenamento: segue sem salvar */
    }
  }, [characterId, journey])

  // atualiza só um campo: update('plan', { id, name })
  const update = (campo, valor) =>
    setJourney((j) => ({ ...j, [campo]: typeof valor === 'function' ? valor(j[campo]) : valor }))

  const reset = () => setJourney(EMPTY)

  return { journey, update, reset }
}
