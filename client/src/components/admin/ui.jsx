/**
 * Peças de formulário do admin — todas no mesmo padrão:
 *   value    → o valor atual
 *   onChange → recebe o NOVO VALOR (não o evento), simplifica o uso:
 *              <TextInput value={draft.name} onChange={set('name')} />
 */

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/40'

export function Field({ label, hint, children }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </div>
  )
}

export function TextInput({ value, onChange, ...props }) {
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />
}

export function TextArea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      value={value ?? ''}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y`}
      {...props}
    />
  )
}

/** options: [{ value: 'cta', label: 'Botão final' }, ...] */
export function Select({ value, onChange, options }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-neutral-900">
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-white" />
      {label}
    </label>
  )
}

/** seletor de cor + campo de texto (#hex), lado a lado */
export function ColorInput({ value, onChange, allowEmpty = false }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
      />
      <TextInput value={value} onChange={onChange} placeholder="#ffffff" />
      {allowEmpty && value && (
        <button type="button" onClick={() => onChange(null)} className="text-xs text-neutral-400 hover:text-white">
          limpar
        </button>
      )}
    </div>
  )
}

const buttonVariants = {
  primary: 'bg-white text-black hover:bg-white/90',
  ghost: 'border border-white/15 text-white hover:bg-white/10',
  danger: 'border border-red-500/40 text-red-300 hover:bg-red-500/15',
}

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  )
}

/** botão pequeno de ícone (↑ ↓ ✕) */
export function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  )
}

/** bloco com título dentro do formulário */
export function FormSection({ title, children }) {
  return (
    <fieldset className="space-y-4 border-t border-white/10 pt-6">
      <legend className="pr-3 font-mono text-xs uppercase tracking-widest text-neutral-300">{title}</legend>
      {children}
    </fieldset>
  )
}
