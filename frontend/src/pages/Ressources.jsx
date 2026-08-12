import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'

const TYPE_LABELS = {
  dataset: 'Jeux de données',
  corpus: 'Corpus',
  dictionnaire: 'Dictionnaires',
  outil: 'Outils',
  bibliotheque: 'Bibliothèques',
  article: 'Articles scientifiques',
  modele: 'Modèles',
}

function useResources() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/knowledge/resources')
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

function ResourceSection({ item, index }) {
  return (
    <motion.article
      className={index > 0 ? 'pt-6 mt-6 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)' } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
    >
      <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
        <h3 className="font-display text-lg font-bold" style={{ color: 'var(--indigo)' }}>
          {item.nom}
        </h3>
        <span className="badge badge-or">{TYPE_LABELS[item.type] || item.type}</span>
      </div>
      <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
        {item.description}
      </p>
      <p className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {item.langues?.map((l, i) => (
          <span key={i} className="badge badge-mil" style={{ fontSize: '0.65rem' }}>{l}</span>
        ))}
        {item.licence && <span>{item.licence}</span>}
        {item.lien && (
          <a
            href={item.lien}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-ui font-medium ml-auto"
            style={{ color: 'var(--or)' }}
          >
            Voir <ExternalLink size={13} />
          </a>
        )}
      </p>
    </motion.article>
  )
}

export default function Ressources() {
  const { data, loading, error } = useResources()
  const [active, setActive] = useState('tous')

  const types = useMemo(() => {
    const set = new Set(data.map((d) => d.type))
    return ['tous', ...Array.from(set)]
  }, [data])

  const filtered = active === 'tous' ? data : data.filter((d) => d.type === active)

  return (
    <DocsLayout
      title="Ressources"
      description="Jeux de données, corpus, outils, bibliothèques, articles et modèles pour travailler sur les langues nationales et africaines."
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
            Impossible de charger les ressources.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-2 mb-10 border-b" style={{ borderColor: 'var(--border)' }}>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className="px-4 py-3 font-ui font-medium text-sm transition-all"
                style={{
                  color: active === t ? 'var(--or)' : 'var(--text-muted)',
                  borderBottom: active === t ? '2px solid var(--or)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t === 'tous' ? 'Tous' : (TYPE_LABELS[t] || t)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="lesson-content"
            >
              {filtered.map((item, i) => (
                <ResourceSection key={item.id} item={item} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </DocsLayout>
  )
}
