import ChannelAbout from './ChannelAbout'
import ChannelLayouts from './ChannelLayouts'
import ChannelProcess from './ChannelProcess'
import ChannelPlans from './ChannelPlans'
import ChannelContact from './ChannelContact'

/**
 * A "grade de programação" da TV.
 * Para criar um canal novo: faça o componente e adicione aqui.
 * A ordem da lista = a ordem dos canais (CH 01, CH 02...).
 * needsLayouts: só aparece se o robô tiver demos com link (admin → Demos).
 */
export const CHANNELS = [
  { id: 'sobre', label: 'O que é', Component: ChannelAbout },
  { id: 'layouts', label: 'Layouts', Component: ChannelLayouts, needsLayouts: true },
  { id: 'processo', label: 'Como funciona', Component: ChannelProcess },
  { id: 'planos', label: 'Planos', Component: ChannelPlans },
  { id: 'contato', label: 'Falar comigo', Component: ChannelContact },
]
