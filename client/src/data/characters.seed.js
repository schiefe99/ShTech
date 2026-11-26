/**
 * SEED = dados iniciais.
 * Na primeira vez que o site abre, o service copia isso para o "banco"
 * (hoje o localStorage; no Dia 4 o SQLite).
 *
 * Formato pensado para virar TABELA depois:
 *   characters (id, name, role, bodyColor, eyeColor, shirtColor, order,
 *               tagline, intro, benefits)
 *   lines      (id, characterId, order, type, text, placeholder, ctaLabel, ctaHref)
 *
 * Tipos de fala (type):
 *   'askName'  → pergunta o nome do visitante (a resposta vira {name})
 *   'question' → pergunta qualquer coisa
 *   'cta'      → fala final com botão (ctaLabel + ctaHref)
 *
 * Use {name} no texto para inserir o nome que o visitante digitou.
 *
 * Página do serviço (/servico/:id):
 *   tagline  → título grande do topo
 *   intro    → texto da seção Nº001
 *   benefits → cards da seção Nº003
 *   process  → etapas do canal "Como funciona" [{ time, title, text }]
 *              (sem process → a TV usa as etapas padrão)
 *
 * ⚠️ Mudou este arquivo? Aumente `version` em services/characterService.js
 *    para o navegador carregar o seed novo.
 */
export const charactersSeed = [
  {
    id: 'luma',
    name: 'LUMA',
    role: 'Landing Pages',
    bodyColor: '#c4c4c4',
    eyeColor: '#e8f1ff',
    order: 1,
    tagline: 'Uma página que apresenta, convence e traz clientes.',
    intro:
      'A maioria dos pequenos negócios depende só do Instagram — e perde cliente que procura no Google ou quer entender o serviço antes de chamar. Uma landing page rápida, bonita e com o botão certo no lugar certo transforma visita em conversa no WhatsApp.',
    benefits: [
      { title: 'Pronto em até 36h', text: 'Com o briefing completo, seu site sai do papel em até 36 horas.' },
      { title: 'Feita para converter', text: 'Cada seção leva o visitante até o botão de contato.' },
      { title: 'Rápida no celular', text: 'Leve, responsiva e otimizada para quem chega pelo Instagram.' },
      { title: 'Você no controle', text: 'Textos, fotos e preços atualizados sempre que precisar.' },
    ],
    process: [
      { time: 'Hora 0', title: 'Briefing', text: 'Você me envia o essencial: logo, textos, fotos e o objetivo da página.' },
      { time: 'Até 36h', title: 'Desenvolvimento', text: 'Com o briefing completo, sua landing page fica pronta em até 36 horas.' },
      { time: 'Ajustes', title: 'Revisão', text: 'Você confere tudo e ajustamos os detalhes rapidinho.' },
      { time: 'No ar', title: 'Deploy', text: 'Publico no seu domínio, com HTTPS, e o site já está pronto para receber clientes.' },
    ],
    lines: [
      { id: 'luma-1', order: 1, type: 'askName', text: 'Oi! Vi que você chegou com uma ideia na cabeça. Como posso te chamar?', placeholder: 'Seu nome' },
      { id: 'luma-2', order: 2, type: 'question', text: 'Prazer, {name}! Me conta: o que seu negócio vende?', placeholder: 'Ex: roupas fitness' },
      { id: 'luma-3', order: 3, type: 'cta', text: 'Uma landing page rápida e bonita resolve isso. Bora conversar?', ctaLabel: 'Falar no WhatsApp', ctaHref: 'https://wa.me' },
    ],
  },
  {
    id: 'kart',
    name: 'KART',
    role: 'E-commerce',
    bodyColor: '#2b2b2b',
    eyeColor: '#7CFFB2',
    order: 2,
    tagline: 'Sua vitrine aberta 24 horas, vendendo enquanto você dorme.',
    intro:
      'Vender só por direct dá trabalho: responder preço, tamanho e estoque um por um. Uma loja online organiza o catálogo, o cliente monta o carrinho sozinho e o pedido chega pronto para você.',
    benefits: [
      { title: 'Catálogo organizado', text: 'Produtos com fotos, variações e preços em um só lugar.' },
      { title: 'Carrinho de verdade', text: 'O cliente escolhe tudo e finaliza sem precisar perguntar.' },
      { title: 'Pedido no WhatsApp', text: 'O pedido chega montado na sua conversa, pronto para fechar.' },
      { title: 'Cresce com você', text: 'Comece simples e adicione pagamento online quando quiser.' },
    ],
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
    tagline: 'Tire sua empresa da planilha.',
    intro:
      'Planilhas compartilhadas, dados duplicados e ninguém sabe qual é a versão certa. Um sistema web feito para o seu processo centraliza as informações, controla acessos e mostra os números que importam.',
    benefits: [
      { title: 'Feito para o seu processo', text: 'O sistema se adapta à empresa, não o contrário.' },
      { title: 'Dados em um só lugar', text: 'Cadastros, histórico e relatórios sempre atualizados.' },
      { title: 'Acesso de qualquer lugar', text: 'No navegador, no computador ou no celular.' },
      { title: 'Indicadores claros', text: 'Dashboards com os números do negócio em tempo real.' },
    ],
    lines: [
      { id: 'core-1', order: 1, type: 'askName', text: 'Sistemas, dashboards, CRMs... é comigo. Como você se chama?', placeholder: 'Seu nome' },
      { id: 'core-2', order: 2, type: 'question', text: '{name}, qual processo da sua empresa ainda roda em planilha?', placeholder: 'Ex: controle de estoque' },
      { id: 'core-3', order: 3, type: 'cta', text: 'Isso vira sistema. Me chama que a gente desenha juntos.', ctaLabel: 'Agendar conversa', ctaHref: '#contato' },
    ],
  },
  {
    id: 'pixel',
    name: 'PIXEL',
    role: 'Design & UI',
    bodyColor: '#e7cff7',
    eyeColor: '#FF7AD9',
    order: 4,
    tagline: 'Antes do código, a cara da sua marca.',
    intro:
      'Um site bonito começa no design. Criamos a identidade visual e as telas no Figma para você aprovar cada detalhe antes da primeira linha de código.',
    benefits: [
      { title: 'Identidade visual', text: 'Logo, cores e tipografia com personalidade.' },
      { title: 'Protótipo no Figma', text: 'Você vê e aprova as telas antes de desenvolver.' },
      { title: 'Consistência', text: 'Um guia simples para usar a marca em tudo.' },
      { title: 'Pronto para o código', text: 'Do Figma direto para o site, sem retrabalho.' },
    ],
    lines: [
      { id: 'pixel-1', order: 1, type: 'askName', text: 'Antes do código vem o design. Qual seu nome?', placeholder: 'Seu nome' },
      { id: 'pixel-2', order: 2, type: 'question', text: '{name}, você já tem identidade visual?', placeholder: 'Sim / Não' },
      { id: 'pixel-3', order: 3, type: 'cta', text: 'Fechado. Eu levo sua marca do Figma até o ar.', ctaLabel: 'Ver portfólio', ctaHref: '#contato' },
    ],
  },
]
