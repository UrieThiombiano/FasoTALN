const LANGUAGES = [
  { code: 'mos', label: 'Mooré' },
  { code: 'dyu', label: 'Dioula' },
  { code: 'bam', label: 'Bambara' },
]

export default function LanguageSelector({ value, onChange, disabled = false }) {
  return (
    <div
      className="inline-flex p-1 rounded-full"
      style={{ background: 'var(--sable)', border: '1px solid var(--border)' }}
      role="radiogroup"
      aria-label="Choisir une langue"
    >
      {LANGUAGES.map((l) => {
        const active = value === l.code
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(l.code)}
            className="font-ui font-medium text-sm rounded-full transition-colors"
            style={{
              padding: '0.5rem 1.25rem',
              background: active ? 'var(--or)' : 'transparent',
              color: active ? 'var(--indigo)' : 'var(--text-muted)',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}

export { LANGUAGES }
