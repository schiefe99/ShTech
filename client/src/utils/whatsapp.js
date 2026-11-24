import { SITE } from '../config'

/**
 * Monta um link do WhatsApp com mensagem já preenchida.
 *   whatsappLink('Olá!') → 'https://wa.me/5511999999999?text=Ol%C3%A1!'
 * encodeURIComponent transforma espaços, acentos e quebras de linha
 * em algo que pode ir numa URL.
 */
export function whatsappLink(message = '') {
  const base = `https://wa.me/${SITE.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
