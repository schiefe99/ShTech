/**
 * PLANOS — as duas formas de contratar.
 *
 * type: 'subscription' → mensal, limitado aos layouts das demos
 *       'project'      → pagamento único, layout exclusivo
 *
 * price: número em reais (ex.: 197) ou null → mostra "Sob consulta"
 * pricePrefix: texto antes do preço (ex.: 'a partir de')
 * highlight: destaca o card (o plano que você quer vender mais)
 */
export const plansSeed = [
  {
    id: 'assinatura',
    order: 1,
    type: 'subscription',
    name: 'Assinatura',
    tagline: 'Seu site no ar rápido, sem investimento inicial alto.',
    price: null,
    pricePrefix: '',
    period: 'mês',
    features: [
      'Escolha um layout da galeria de demos',
      'Personalizado com sua marca: logo, cores e textos',
      'Hospedagem e domínio configurados',
      'Ajustes de conteúdo todo mês',
      'Suporte pelo WhatsApp',
    ],
    limits: ['Somente layouts da galeria', 'Sem funcionalidades sob medida'],
    highlight: true,
    ctaLabel: 'Quero assinar',
  },
  {
    id: 'projeto',
    order: 2,
    type: 'project',
    name: 'Projeto sob medida',
    tagline: 'Layout exclusivo e funcionalidades pensadas para o seu negócio.',
    price: null,
    pricePrefix: 'a partir de',
    period: null,
    features: [
      'Layout exclusivo, desenhado do zero',
      'Funcionalidades sob medida',
      'Integrações: pagamento, CRM, APIs',
      'Painel administrativo',
      'Código e acessos entregues a você',
    ],
    limits: [],
    highlight: false,
    ctaLabel: 'Pedir orçamento',
  },
]
