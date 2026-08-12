import { motion } from 'framer-motion'
import { TrendingDown, Loader2, AlertTriangle } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import Callout from '../components/ui/Callout'
import StatTile from '../components/ui/StatTile'
import SourceList from '../components/ui/SourceList'
import JoshiTaxonomyDiagram from '../components/ui/JoshiTaxonomyDiagram'
import useKnowledge from '../hooks/useKnowledge'

const badgeClasses = ['badge-or', 'badge-mil', 'badge-argile']

const CHIFFRES_CLES = [
  { value: '46,76 %', label: "WER du meilleur système ASR bambara testé (benchmark AfricaNLP 2026)" },
  { value: 'jusqu\'à 8,9×', label: 'surcoût de tokenisation du N\'Ko face à l\'anglais sur les LLM de pointe' },
  { value: '42 / ~2 000', label: 'langues africaines réellement bien couvertes par les grands LLM' },
  { value: '15', label: 'corpus web audités sans aucun texte exploitable (Kreutzer et al. 2022)' },
]

function ChallengeSection({ item, index }) {
  return (
    <motion.section
      className={index > 0 ? 'pt-8 mt-8 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)' } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h2 data-toc className="font-display text-xl font-bold" style={{ color: 'var(--indigo)' }}>
          {item.titre}
        </h2>
        <span className={`badge ${badgeClasses[index % badgeClasses.length]}`}>
          {item.categorie}
        </span>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
        {item.description}
      </p>
      {item.id === 'faibles-ressources' && (
        <div className="mb-4">
          <JoshiTaxonomyDiagram />
        </div>
      )}
      {item.exemple && (
        <Callout variant="example" title="Exemple">
          {item.exemple}
        </Callout>
      )}
      {item.impact && (
        <p className="flex items-start gap-2 text-xs mt-3" style={{ color: 'var(--argile)' }}>
          <TrendingDown size={14} className="flex-shrink-0 mt-0.5" />
          <span style={{ color: 'var(--text-muted)' }}>{item.impact}</span>
        </p>
      )}
      <SourceList sources={item.sources} />
    </motion.section>
  )
}

export default function Defis() {
  const { data, loading, error } = useKnowledge('challenges')

  return (
    <DocsLayout
      title="Les défis du TALN"
      description="Pourquoi le traitement automatique des langues nationales reste un problème de recherche ouvert — revue de littérature sourcée, avec liens vers les publications originales."
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
            Impossible de charger les défis.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {CHIFFRES_CLES.map((c) => (
              <StatTile key={c.label} value={c.value} label={c.label} />
            ))}
          </div>

          <div className="lesson-content">
            {data.map((item, i) => (
              <ChallengeSection key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </DocsLayout>
  )
}
