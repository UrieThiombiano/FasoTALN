import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ group, title }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center flex-wrap gap-1.5 font-ui text-xs mb-4">
      <Link to="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
        Accueil
      </Link>
      {group && (
        <>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>{group}</span>
        </>
      )}
      <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
      <span style={{ color: 'var(--or)', fontWeight: 600 }}>{title}</span>
    </nav>
  )
}
