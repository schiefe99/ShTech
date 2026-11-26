import { useState } from 'react'
import { useConversation } from '../../hooks/useConversation'
import { useTypewriter } from '../../hooks/useTypewriter'

/**
 * CHAT PANEL — a conversa estilo Lisa, do lado esquerdo da tela.
 * Só cuida da INTERFACE; a lógica fica nos hooks.
 *
 * onOpenTv(whatsHref) → entra na TV do robô. Ao fim da conversa,
 * passa junto o link do WhatsApp já montado com as respostas.
 */
export default function ChatPanel({ character, visitorName, onNameChange, onOpenTv }) {
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

      {/* Fim da conversa: entra na TV (o WhatsApp vai junto, no último canal) */}
      {done && isFinished && (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => onOpenTv(ctaHref)}
            className="rounded-full bg-neutral-900 px-7 py-3 text-white transition hover:bg-neutral-700"
          >
            Ver como funciona ▸
          </button>
          <a
            href={ctaHref}
            target={ctaHref?.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            {current.ctaLabel ?? 'ou falar agora'}
          </a>
        </div>
      )}
    </div>
  )
}
