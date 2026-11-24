/**
 * DEMOS — layouts de exemplo mostrados na página de cada serviço.
 *
 * Vira tabela no Dia 4:
 *   demos (id, characterId, order, title, niche, url, thumbnail,
 *          description, features, inSubscription, accent)
 *
 * characterId     → a qual serviço/robô a demo pertence (chave estrangeira)
 * url             → site no ar (null = "em breve")
 * thumbnail       → imagem em /public (opcional; sem ela o card usa gradiente)
 * inSubscription  → true = disponível no plano de Assinatura
 * accent          → cor do card quando não há thumbnail
 */
export const demosSeed = [
  // ---------- LUMA · Landing Pages ----------
  {
    id: 'demo-mallu',
    characterId: 'luma',
    order: 1,
    title: 'Mallu Soluções',
    niche: 'Consultoria empresarial',
    url: 'https://mallusolucoes.com.br',
    thumbnail: null,
    description:
      'Landing page institucional com animações no scroll, apresentação de serviços e contato direto. Ideal para empresas de serviços B2B.',
    features: ['Animações no scroll', 'Seções de serviços', 'Botão de WhatsApp', 'SEO básico'],
    inSubscription: true,
    accent: '#3b5bdb',
  },
  {
    id: 'demo-estetica',
    characterId: 'luma',
    order: 2,
    title: 'Studio Beleza',
    niche: 'Estética e beleza',
    url: null,
    thumbnail: null,
    description: 'Página com galeria de antes/depois, lista de procedimentos e agendamento pelo WhatsApp.',
    features: ['Galeria', 'Tabela de serviços', 'Agendamento via WhatsApp'],
    inSubscription: true,
    accent: '#d6336c',
  },
  {
    id: 'demo-restaurante',
    characterId: 'luma',
    order: 3,
    title: 'Sabor da Casa',
    niche: 'Restaurantes e delivery',
    url: null,
    thumbnail: null,
    description: 'Cardápio visual, horário de funcionamento, mapa e pedido direto no WhatsApp.',
    features: ['Cardápio', 'Mapa', 'Pedido via WhatsApp'],
    inSubscription: true,
    accent: '#e8590c',
  },

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
