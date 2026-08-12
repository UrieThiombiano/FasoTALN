import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getAdjacent } from '../../config/nav'

export default function LessonNav() {
  const { pathname } = useLocation()
  const { prev, next } = getAdjacent(pathname)

  if (!prev && !next) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
      {prev ? (
        <Link to={prev.to} className="card-fx p-4 flex items-center gap-3 no-underline">
          <ArrowLeft size={18} className="flex-shrink-0" color="var(--or)" />
          <div>
            <div className="font-ui text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Page précédente
            </div>
            <div className="font-display font-bold text-sm" style={{ color: 'var(--indigo)' }}>{prev.label}</div>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link to={next.to} className="card-fx p-4 flex items-center justify-end gap-3 text-right no-underline">
          <div>
            <div className="font-ui text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Page suivante
            </div>
            <div className="font-display font-bold text-sm" style={{ color: 'var(--indigo)' }}>{next.label}</div>
          </div>
          <ArrowRight size={18} className="flex-shrink-0" color="var(--or)" />
        </Link>
      ) : <div />}
    </div>
  )
}
