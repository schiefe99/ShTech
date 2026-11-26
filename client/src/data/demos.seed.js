/**
 * DEMOS — layouts de exemplo mostrados na página de cada serviço.
 *
 * Vira tabela no Dia 4:
 *   demos (id, characterId, order, title, niche, url, thumbnail,
 *          description, features, inSubscription, accent)
 *
 * characterId     → a qual serviço/robô a demo pertence (chave estrangeira)
 * url             → '/layout/<key>' para um layout pronto
 *                   (null = não aparece no canal Layouts)
 * thumbnail       → imagem em /public (opcional; sem ela o card usa gradiente)
 * inSubscription  → true = disponível no plano de Assinatura
 * accent          → cor do card quando não há thumbnail
 */
// ".js" no final: este arquivo também é lido pelo servidor (Node exige a extensão)
import { LAYOUTS } from './layoutPresets.js'

/**
 * Cada layout pronto vira uma demo do LUMA com url '/layout/<key>':
 * o site reconhece esse formato e mostra a prévia AO VIVO personalizada.
 */
function layoutDemos() {
  return LAYOUTS.map((l, i) => ({
    id: `layout-${l.key}`,
    characterId: 'luma',
    order: i + 1,
    title: l.label,
    niche: l.tag,
    url: `/layout/${l.key}`,
    thumbnail: null,
    description: l.description,
    features: l.features,
    inSubscription: true,
    accent: l.accent,
  }))
}

export const demosSeed = [
  // ---------- LUMA · Landing Pages ----------
  // os 3 layouts prontos (vêm do app de prospecção) — gerados acima
  ...layoutDemos(),

  // ---------- KART · E-commerce ----------
  {
    id: 'demo-loja-fitness',
    characterId: 'kart',
    order: 1,
    title: 'Loja Fitness',
    niche: 'Moda e roupas',
    url: null,
    thumbnail: null,
    description: 'Vitrine de produtos com carrinho que finaliza o pedido no WhatsApp.',
    features: ['Catálogo', 'Carrinho', 'Checkout via WhatsApp'],
    inSubscription: true,
    accent: '#2f9e44',
  },
  {
    id: 'demo-pet-shop',
    characterId: 'kart',
    order: 2,
    title: 'Pet Mania',
    niche: 'Pet shop',
    url: null,
    thumbnail: null,
    description: 'Loja de rações e acessórios com filtro por tipo de pet e pedido finalizado no WhatsApp.',
    features: ['Filtro por categoria', 'Carrinho', 'Checkout via WhatsApp'],
    inSubscription: true,
    accent: '#1c7ed6',
  },

  // ---------- CORE · Sistemas Web ----------
  {
    id: 'demo-dashboard',
    characterId: 'core',
    order: 1,
    title: 'Painel de Gestão',
    niche: 'Controle interno',
    url: null,
    thumbnail: null,
    description: 'Dashboard com indicadores, cadastros (CRUD) e relatórios.',
    features: ['Gráficos', 'Cadastros', 'Login'],
    inSubscription: false,
    accent: '#f08c00',
  },

  // ---------- PIXEL · Design & UI ----------
  {
    id: 'demo-identidade',
    characterId: 'pixel',
    order: 1,
    title: 'Identidade Visual',
    niche: 'Marca e Figma',
    url: null,
    thumbnail: null,
    description: 'Logo, paleta, tipografia e telas no Figma prontas para virar site.',
    features: ['Logo', 'Paleta de cores', 'Protótipo no Figma'],
    inSubscription: false,
    accent: '#ae3ec9',
  },
]
