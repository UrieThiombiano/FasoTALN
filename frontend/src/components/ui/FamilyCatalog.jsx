export default function FamilyCatalog({ familles, source }) {
  if (!familles?.length) return null
  return (
    <div className="flex flex-col gap-6">
      {familles.map((f) => (
        <div key={f.nom}>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--indigo)' }}>
              {f.nom}
            </h3>
            <span className="font-ui text-xs" style={{ color: 'var(--text-muted)' }}>
              {f.phylum} · {f.nombre} langue{f.nombre > 1 ? 's' : ''}
              {f.echantillon ? ' au total — exemples :' : ''}
            </span>
          </div>
          {f.description && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
              {f.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {f.langues.map((l) => (
              <span
                key={l}
                className="font-ui text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'var(--sable)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      ))}
      {source && (
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
          Source : {source}
        </p>
      )}
    </div>
  )
}
