import { motion } from 'framer-motion'
import { Loader2, AlertTriangle } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import Callout from '../components/ui/Callout'
import StatTile from '../components/ui/StatTile'
import SourceList from '../components/ui/SourceList'
import ApproachesOverview from '../components/ui/ApproachesOverview'
import useKnowledge from '../hooks/useKnowledge'

const CHIFFRES_CLES = [
  { value: '+14,6 pts', label: 'précision XNLI gagnée par XLM-R face à mBERT (Conneau et al. 2020)' },
  { value: '517', label: "langues africaines couvertes par Serengeti, contre ~31 avant lui" },
  { value: '×10 000', label: 'réduction des paramètres entraînables permise par LoRA' },
  { value: '+25 %', label: 'gain minimal de score BLEU avec augmentation de données (6 langues africaines)' },
]

function ApproachSection({ item, index }) {
  return (
    <motion.section
      id={item.id}
      className={index > 0 ? 'pt-10 mt-10 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)', scrollMarginTop: '6rem' } : { scrollMarginTop: '6rem' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.4) }}
    >
      <h2 data-toc className="font-display text-xl font-bold mb-3" style={{ color: 'var(--indigo)' }}>
        {item.nom}
      </h2>
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
        {item.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Callout variant="example" title="Avantages">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.avantages}</p>
        </Callout>
        <Callout variant="attention" title="Limites">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.limites}</p>
        </Callout>
      </div>

      {item.exemples_usage && (
        <Callout variant="note" title="Cas d'usage">
          {item.exemples_usage}
        </Callout>
      )}

      <SourceList sources={item.sources} />
    </motion.section>
  )
}

export default function Approches() {
  const { data, loading, error } = useKnowledge('approaches')

  return (
    <DocsLayout
      title="Approches actuelles"
      description="Comment le TALN multilingue et cross-lingue aborde aujourd'hui les langues à faibles ressources — revue de littérature sourcée, avec liens vers les publications originales."
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
            Impossible de charger les approches.
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

          <ApproachesOverview items={data} />

          <div className="lesson-content">
            {data.map((item, i) => (
              <ApproachSection key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </DocsLayout>
  )
}
