/**
 * LAYOUTS PRONTOS — os 3 modelos de landing page que o visitante escolhe
 * no canal "Layouts" da LUMA. Vêm do app de prospecção (prospectalp):
 *
 *   essencial → base_lp.html.j2           (o 1º modelo, página única simples)
 *   foto      → academia_lp.html.j2       (o 2º: foto grande + agenda de aula)
 *   animado   → barbearia_mallu_lp.html.j2 (o 3º: animações e transições da Mallu)
 *
 * O HTML de cada um fica em client/public/layouts/<key>.html, já pronto,
 * com marcadores no lugar dos dados do cliente:
 *   §NOME§   → nome do negócio      §CIDADE§ → cidade
 *   §WA§     → link do WhatsApp da SHTECH
 * Quem troca os marcadores é utils/renderLanding.js.
 *
 * Para atualizar os HTML quando mudar algo no prospect:
 *   python tools/gerar_layouts.py   (na raiz do projeto ShTech)
 *
 * Para criar um 4º layout: gere o HTML, salve em public/layouts/<key>.html
 * e adicione um objeto aqui. O seed cria a demo sozinho.
 */
export const LAYOUTS = [
  {
    key: 'essencial',
    label: 'Essencial',
    tag: 'Layout 1 · direto ao ponto',
    accent: '#16a34a',
    description: 'Página única, leve e rápida: apresentação, serviços, depoimentos e WhatsApp em destaque.',
    features: ['Página única', 'Carrega rápido', 'Botão de WhatsApp fixo'],
  },
  {
    key: 'foto',
    label: 'Com foto e agenda',
    tag: 'Layout 2 · visual forte',
    accent: '#4caf50',
    description: 'Foto grande no topo, modalidades com imagens, planos e agendamento de horário na própria página.',
    features: ['Foto em destaque', 'Agendamento', 'Planos e preços'],
  },
  {
    key: 'animado',
    label: 'Animado',
    tag: 'Layout 3 · estilo Mallu',
    accent: '#e5383b',
    description: 'O mais completo: animações e transições no scroll, resumo de agendamento ao vivo e visual escuro premium.',
    features: ['Animações no scroll', 'Agendamento ao vivo', 'Visual premium'],
  },
]

/** acha um layout pela key ('foto') */
export const getLayout = (key) => LAYOUTS.find((l) => l.key === key) ?? null

/** '/layout/foto' → 'foto'  |  qualquer outra url → null */
export function layoutKeyFromUrl(url = '') {
  const match = /^\/layout\/([\w-]+)/.exec(url ?? '')
  return match && getLayout(match[1]) ? match[1] : null
}
