import { useEffect, useState } from 'react'

/**
 * useTypewriter — revela o texto letra por letra.
 *
 *   const { typed, done, skip } = useTypewriter('Olá!', 30)
 *
 *   typed → o pedaço já "digitado"
 *   done  → true quando terminou
 *   skip  → mostra tudo de uma vez (ex.: clique do usuário)
 */
export function useTypewriter(text, speed = 28) {
  const [count, setCount] = useState(0)

  // texto novo → recomeça do zero
  useEffect(() => {
    setCount(0)
  }, [text])

  useEffect(() => {
    if (count >= text.length) return // terminou: não agenda mais nada

    const id = setTimeout(() => setCount((c) => c + 1), speed)
    // cleanup: se o componente sair da tela ou o texto mudar, cancela
    return () => clearTimeout(id)
  }, [count, text, speed])

  return {
    typed: text.slice(0, count),
    done: count >= text.length,
    skip: () => setCount(text.length),
  }
}
