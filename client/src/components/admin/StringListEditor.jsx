import { TextInput, IconButton, Button } from './ui'
import { updateAt, removeAt, move } from '../../utils/listOps'

/**
 * Editor de lista de textos: ['Catálogo', 'Carrinho', ...]
 * Usado em features (demos e planos) e limits (planos).
 */
export default function StringListEditor({ value = [], onChange, placeholder }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <TextInput value={item} onChange={(v) => onChange(updateAt(value, i, v))} placeholder={placeholder} />
          <IconButton label="Subir" onClick={() => onChange(move(value, i, -1))} disabled={i === 0}>↑</IconButton>
          <IconButton label="Descer" onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1}>↓</IconButton>
          <IconButton label="Remover" onClick={() => onChange(removeAt(value, i))}>✕</IconButton>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...value, ''])}>+ Adicionar</Button>
    </div>
  )
}
