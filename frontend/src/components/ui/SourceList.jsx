import { ExternalLink, BookOpen } from 'lucide-react'

export default function SourceList({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        <BookOpen size={13} /> Sources
      </div>
      <ul className="flex flex-col gap-1">
        {sources.map((s) => (
          <li key={s.lien} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {s.auteurs} ({s.annee}). « {s.titre} ». <em>{s.venue}</em>.{' '}
            <a
              href={s.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium"
              style={{ color: 'var(--or)' }}
            >
              Lire <ExternalLink size={11} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
