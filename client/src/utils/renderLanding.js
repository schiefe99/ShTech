import { useEffect, useState } from 'react'
import { whatsappLink } from './whatsapp'

/**
 * RENDER LANDING — pega o HTML pronto de um layout (public/layouts/<key>.html)
 * e troca os marcadores pelos dados que o visitante digitou.
 *
 * O resultado (texto) vai num <iframe srcDoc={...}>: a página roda isolada,
 * com o CSS e as animações dela, sem misturar com o Tailwind do nosso site.
 *
 * SEGURANÇA: o que o usuário digita passa por esc() antes de entrar no HTML.
 * Sem isso, alguém digitando "<script>" no nome injetaria código na página.
 * A barra invertida também é escapada porque o nome aparece dentro de
 * strings de JavaScript da página (window.DEMO = {"marca": "..."}).
 */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '\\': '&#92;' }
const esc = (v = '') => String(v).replace(/[&<>"'\\]/g, (c) => ESCAPES[c])

// cache: cada arquivo é baixado UMA vez, mesmo com vários cards na tela
const cache = new Map()

/** baixa o HTML-modelo do layout (devolve uma Promise com o texto) */
export function loadLayout(key) {
  if (!cache.has(key)) {
    const promise = fetch(`/layouts/${key}.html`).then((r) => {
      if (!r.ok) throw new Error(`Layout "${key}" não encontrado`)
      return r.text()
    })
    promise.catch(() => cache.delete(key)) // deu erro? tenta de novo da próxima vez
    cache.set(key, promise)
  }
  return cache.get(key)
}

/** troca §NOME§, §CIDADE§ e §WA§ no HTML-modelo */
export function renderLanding(template, { businessName, city, layoutLabel } = {}) {
  const name = businessName?.trim() || 'Seu Negócio'
  const wa = whatsappLink(`Olá! Vi o layout "${layoutLabel}" e quero um site assim para ${name}.`)
  return template
    .replaceAll('§NOME§', esc(name))
    .replaceAll('§CIDADE§', esc(city?.trim() || 'sua cidade'))
    .replaceAll('§WA§', esc(wa))
}

/**
 * Hook: devolve o HTML pronto do layout, ou null enquanto carrega.
 *   const html = useLayoutHtml('foto', { businessName: 'Zé', city: 'Piracicaba' })
 */
export function useLayoutHtml(key, { businessName, city, layoutLabel }) {
  const [template, setTemplate] = useState(null)

  useEffect(() => {
    let ativo = true // evita setState se o componente sumiu antes do fetch terminar
    setTemplate(null)
    if (!key) return
    loadLayout(key).then((t) => ativo && setTemplate(t)).catch(() => ativo && setTemplate(''))
    return () => {
      ativo = false
    }
  }, [key])

  if (!key) return ''
  if (template === null) return null
  return renderLanding(template, { businessName, city, layoutLabel })
}
