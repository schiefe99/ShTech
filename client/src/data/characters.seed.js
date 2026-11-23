/**
 * SEED = dados iniciais.
 * Na primeira vez que o site abre, o service copia isso para o "banco"
 * (hoje o localStorage; no Dia 4 o SQLite).
 *
 * Formato pensado para virar TABELA depois:
 *   characters (id, name, role, bodyColor, eyeColor, order)
 *   lines      (id, characterId, order, type, text, placeholder, ctaLabel, ctaHref)
 *
 * Tipos de fala (type):
 *   'askName'  → pergunta o nome do visitante (a resposta vira {name})
 *   'question' → pergunta qualquer coisa
 *   'cta'      → fala final com botão (ctaLabel + ctaHref)
 *
 * Use {name} no texto para inserir o nome que o visitante digitou.
 */
export const charactersSeed = [
  {
    id: 'luma',
    name: 'LUMA',
    role: 'Landing Pages',
    bodyColor: '#c4c4c4',
    eyeColor: '#e8f1ff',
    order: 1,
    lines: [
      { id: 'luma-1', order: 1, type: 'askName', text: 'Oi! Vi que você chegou com uma ideia na cabeça. Como posso te chamar?', placeholder: 'Seu nome' },
      { id: 'luma-2', order: 2, type: 'question', text: 'Prazer, {name}! Me conta: o que seu negócio vende?', placeholder: 'Ex: roupas fitness' },
      { id: 'luma-3', order: 3, type: 'cta', text: 'Uma landing page rápida e bonita resolve isso. Bora conversar?', ctaLabel: 'Falar no WhatsApp', ctaHref: 'https://wa.me/55SEUNUMERO' },
    ],
  },
  {
    id: 'kart',
    name: 'KART',
    role: 'E-commerce',
    bodyColor: '#2b2b2b',
    eyeColor: '#7CFFB2',
    order: 2,
    lines: [
      { id: 'kart-1', order: 1, type: 'askName', text: 'Quer vender online? Eu cuido do carrinho. Qual seu nome?', placeholder: 'Seu nome' },
      { id: 'kart-2', order: 2, type: 'question', text: '{name}, quantos produtos você tem hoje?', placeholder: 'Ex: 50' },
      { id: 'kart-3', order: 3, type: 'cta', text: 'Dá pra montar uma loja sob medida pra isso. Vamos orçar?', ctaLabel: 'Pedir orçamento', ctaHref: '#contato' },
    ],
  },
  {
    id: 'core',
    name: 'CORE',
    role: 'Sistemas Web',
    bodyColor: '#8a8f98',
    eyeColor: '#FFB86B',
    order: 3,
    lines: [
      { id: 'core-1', order: 1, type: 'askName', text: 'Sistemas, dashboards, CRMs... é comigo. Como você se chama?', placeholder: 'Seu nome' },
      { id: 'core-2', order: 2, type: 'question', text: '{name}, qual processo da sua empresa ainda roda em planilha?', placeholder: 'Ex: controle de estoque' },
      { id: 'core-3', order: 3, type: 'cta', text: 'Isso vira sistema. Me chama que a gente desenha juntos.', ctaLabel: 'Agendar conversa', ctaHref: '#contato' },
    ],
  },
   {
    id: 'core',
    name: 'PIXEL',
    role: 'Design & UI',
    bodyColor: '#e7cff7',
    eyeColor: '#FF7AD9',
    order: 4,
    lines: [
  { id: 'pixel-1', order: 1, type: 'askName', text: 'Antes do código vem o design. Qual seu nome?', placeholder: 'Seu nome' },
  { id: 'pixel-2', order: 2, type: 'question', text: '{name}, você já tem identidade visual?', placeholder: 'Sim / Não' },
  { id: 'pixel-3', order: 3, type: 'cta', text: 'Fechado. Eu levo sua marca do Figma até o ar.', ctaLabel: 'Ver portfólio', ctaHref: '#contat'},
      ],
   },
