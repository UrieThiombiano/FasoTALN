import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import useKnowledge from '../hooks/useKnowledge'

function TermCard({ term, index }) {
  return (
    <motion.div
      className="card-fx p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="font-display text-base font-bold mb-1.5" style={{ color: 'var(--indigo)' }}>
        {term.terme}
      </div>
      <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
        {term.definition}
      </p>
      {term.voir && (
        <Link
          to={term.voir}
          className="inline-flex items-center gap-1 text-xs font-ui font-medium no-underline"
          style={{ color: 'var(--or)' }}
        >
          Voir sur le site <ArrowRight size={12} />
        </Link>
      )}
    </motion.div>
  )
}

export default function Glossaire() {
  const { data, loading, error } = useKnowledge('glossaire')

  return (
    <DocsLayout
      title="Glossaire"
      description="Le vocabulaire du TALN utilisé sur cette plateforme, en français, pour qui découvre le domaine."
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
            Impossible de charger le glossaire.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-10">
          {data.map((cat, ci) => (
            <section key={cat.categorie} className={ci > 0 ? 'pt-8 border-t' : ''} style={ci > 0 ? { borderColor: 'var(--border)' } : undefined}>
              <h2 data-toc className="font-display text-xl font-bold mb-4" style={{ color: 'var(--indigo)' }}>
                {cat.categorie}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.termes.map((t, ti) => (
                  <TermCard key={t.terme} term={t} index={ti} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </DocsLayout>
  )
}
