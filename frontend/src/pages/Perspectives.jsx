import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Loader2, AlertTriangle, ArrowRight } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'

const badgeClasses = ['badge-or', 'badge-mil', 'badge-argile']

function usePerspectives() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/knowledge/perspectives')
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((json) => { if (!cancelled) setData(Array.isArray(json) ? json : []) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { data: data || [], loading, error }
}

export default function Perspectives() {
  const { data, loading, error } = usePerspectives()

  return (
    <DocsLayout
      title="Perspectives de recherche"
      description="Comment la contribution de FasoTALN est pensée pour évoluer : nouvelles langues, nouvelles tâches, nouveaux modèles. Pour la situation du TALN au Burkina Faso dans son ensemble, voir la rubrique Écosystème."
    >
      {loading && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
          style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--or)" />
          <p className="font-ui text-sm">Chargement…</p>
        </div>
      )}

      {!loading && error && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
          style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
        >
          <AlertTriangle size={28} color="var(--argile)" />
          <p className="font-ui text-sm">
            Impossible de charger les perspectives.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="lesson-content">
          {data.map((item, i) => (
            <motion.section
              key={item.id}
              className={i > 0 ? 'pt-6 mt-6 border-t' : ''}
              style={i > 0 ? { borderColor: 'var(--border)' } : undefined}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <Compass size={16} className="flex-shrink-0" color="var(--or-dark)" />
                <h2 data-toc className="font-display text-lg font-bold" style={{ color: 'var(--indigo)' }}>
                  {item.titre}
                </h2>
                <span className={`badge ${badgeClasses[i % badgeClasses.length]}`}>
                  {item.categorie}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {item.description}
              </p>
            </motion.section>
          ))}

          <Link
            to="/ecosysteme"
            className="flex items-center justify-between gap-3 rounded-2xl p-5 mt-2 no-underline"
            style={{ background: 'rgba(109,91,208,0.06)', border: '1px solid var(--border)' }}
          >
            <div>
              <div className="font-ui text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--or)' }}>
                Voir plus large
              </div>
              <div className="font-display font-bold" style={{ color: 'var(--indigo)' }}>
                L'écosystème du TALN au Burkina Faso : institutions, feuilles de route, comment s'y engager
              </div>
            </div>
            <ArrowRight size={20} className="flex-shrink-0" color="var(--or)" />
          </Link>
        </div>
      )}
    </DocsLayout>
  )
}
