import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getLayout } from '../data/layoutPresets'
import { useLayoutHtml } from '../utils/renderLanding'

/**
 * /layout/:key?nome=...&cidade=...  → a landing page em TELA CHEIA.
 * Aberta pelo link "Tela cheia" do canal Layouts.
 * useSearchParams lê o que vem depois do "?" na URL.
 */
export default function LayoutPreview() {
  const { key } = useParams()
  const [params] = useSearchParams()
  const layout = getLayout(key)
  // hooks sempre no topo, antes de qualquer "return" (regra dos hooks)
  const html = useLayoutHtml(layout ? key : null, {
    businessName: params.get('nome'),
    city: params.get('cidade'),
    layoutLabel: layout?.label,
  })

  if (!layout || html === '') {
    return (
      <div className="grid min-h-screen place-items-center">
        <p>
          Layout não encontrado. <Link to="/" className="underline">Voltar</Link>
        </p>
      </div>
    )
  }

  if (html === null) return <div className="grid min-h-screen place-items-center font-mono">Carregando...</div>

  return <iframe title={layout.label} srcDoc={html} className="fixed inset-0 h-full w-full border-0" />
}
