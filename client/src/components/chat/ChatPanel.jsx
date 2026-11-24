import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useConversation } from '../../hooks/useConversation'
import { useTypewriter } from '../../hooks/useTypewriter'

/**
 * CHAT PANEL — a conversa estilo Lisa, do lado esquerdo da tela.
 * Só cuida da INTERFACE; a lógica fica nos hooks.
 */
export default function ChatPanel({ character, visitorName, onNameChange }) {
  const { current, text, answer, isFinished, ctaHref } = useConversation(character, {
    visitorName,
    onNameChange,
  })
  const { typed, done, skip } = useTypewriter(text)
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // impede o form de recarregar a página
    if (!input.trim()) return
    answer(input)
    setInput('')
  }

  if (!current) return null

  return (
    <div className="max-w-md">
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
        {character.role}
      </p>
      <h1 className="mt-1 text-5xl font-semibold tracking-tight">{character.name}</h1>
      <Link
        to={`/servico/${character.id}`}
        className="mt-2 inline-block font-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900"
      >
        Conhecer o serviço →
      </Link>

      {/* clicar no texto pula a digitação */}
      <p
        onClick={skip}
        className="mt-6 min-h-[5.5rem] cursor-default text-2xl leading-snug text-neutral-900"
      >
        {typed}
        <span className="ml-1 inline-block h-6 w-2.5 animate-pulse bg-neutral-900 align-middle" />
      </p>

      {/* Pergunta: aparece o campo quando terminar de digitar */}
      {done && !isFinished && (
        <form onSubmit={handleSubmit} className="mt-8">
          <input
            key={current.id} // fala nova → campo novo (limpa e foca)
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={current.placeholder ?? 'Digite aqui'}
            className="w-full border-b border-neutral-900 bg-transparent py-2 text-lg outline-none placeholder:text-neutral-500"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              aria-label="Enviar"
              className="grid h-9 w-14 place-items-center rounded-full bg-white shadow transition hover:scale-105"
            >
              →
            </button>
          </div>
        </form>
      )}

      {/* Fim da conversa: botão de ação */}
      {done && isFinished && (
        <a
          href={ctaHref}
          target={ctaHref?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="mt-8 inline-block rounded-full bg-neutral-900 px-7 py-3 text-white transition hover:bg-neutral-700"
        >
          {current.ctaLabel ?? 'Continuar'}
        </a>
      )}
    </div>
  )
}
