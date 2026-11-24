import { useMemo, useState } from 'react'
import { interpolate, sortByOrder } from '../utils/helpers'
import { whatsappLink } from '../utils/whatsapp'

/**
 * useConversation — a "máquina de estados" da conversa com UM personagem.
 *
 * Recebe de fora (Home):
 *   visitorName / onNameChange → o nome vive na Home para ser LEMBRADO
 *   entre robôs (o ChatPanel é remontado a cada troca; a Home não).
 *
 * Estado local:
 *   stepIndex → em qual fala estamos
 *   answers   → respostas do visitante { [lineId]: 'texto' }
 *
 * Fluxo de uma fala:
 *   askName  → resposta vira o nome → próxima fala
 *   question → resposta guardada em answers → próxima fala
 *   cta      → fim: mostra o botão (o link já leva as respostas)
 */
export function useConversation(character, { visitorName = '', onNameChange } = {}) {
  const lines = useMemo(() => sortByOrder(character.lines), [character.lines])

  // Valor inicial calculado UMA vez (na montagem):
  // se já sabemos o nome, começa na primeira fala que não pergunta nome
  const [stepIndex, setStepIndex] = useState(() => {
    if (!visitorName) return 0
    const first = lines.findIndex((l) => l.type !== 'askName')
    return Math.max(0, first)
  })
  const [answers, setAnswers] = useState({})

  const current = lines[stepIndex]
  const values = { name: visitorName }

  function answer(value) {
    const clean = value.trim()
    if (!clean || !current) return

    if (current.type === 'askName') onNameChange?.(clean)
    setAnswers((prev) => ({ ...prev, [current.id]: clean }))
    setStepIndex((i) => Math.min(i + 1, lines.length - 1))
  }

  return {
    current,
    text: interpolate(current?.text, values),
    answer,
    isFinished: current?.type === 'cta',
    ctaHref: current?.type === 'cta' ? buildCtaHref(current, character, lines, answers, values) : null,
  }
}

/**
 * Se o CTA for WhatsApp, monta a mensagem já preenchida:
 *   "Olá! Sou Ana. Vim pelo LUMA (Landing Pages).
 *    • o que seu negócio vende? → roupas fitness"
 * Qualquer outro link (ex.: #contato) volta como está.
 */
function buildCtaHref(ctaLine, character, lines, answers, values) {
  const href = ctaLine.ctaHref ?? '#'
  if (!href.startsWith('https://wa.me')) return href

  const intro = values.name
    ? `Olá! Sou ${values.name}. Vim pelo ${character.name} (${character.role}).`
    : `Olá! Vim pelo ${character.name} (${character.role}).`

  const qa = lines
    .filter((l) => l.type === 'question' && answers[l.id])
    .map((l) => `• ${questionOnly(interpolate(l.text, values))} → ${answers[l.id]}`)

  const message = [intro, ...qa].join('\n')
  // o número vem do config.js (SITE.whatsapp), igual ao resto do site
  return whatsappLink(message)
}

/**
 * Tira o "papo" antes da pergunta para a mensagem ficar limpa:
 *   'Prazer, Ana! Me conta: o que seu negócio vende?' → 'o que seu negócio vende?'
 * Pega o trecho depois do último ':' ou '!' (se houver).
 */
function questionOnly(text) {
  const parts = text.split(/[:!]\s*/)
  return parts[parts.length - 1] || text
}
