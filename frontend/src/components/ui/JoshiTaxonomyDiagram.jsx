import { motion } from 'framer-motion'

/**
 * Visualise la taxonomie de dotation en ressources numériques des langues
 * (Joshi et al., 2020, ACL) — classes 0 (« The Left-Behinds ») à 5
 * (« The Winners »). pct est une hauteur relative purement illustrative,
 * pas une métrique chiffrée par l'étude.
 */
const CLASSES = [
  { n: 0, nom: 'The Left-Behinds', desc: 'Ressources numériques quasi inexistantes', pct: 8 },
  { n: 1, nom: 'The Scraping-Bys', desc: 'Un peu de texte non annoté, très peu de données étiquetées', pct: 18 },
  { n: 2, nom: 'The Hopefuls', desc: 'Un petit jeu de données étiquetées existe', pct: 32 },
  { n: 3, nom: 'The Rising Stars', desc: 'Forte présence web, pré-entraînement non supervisé possible', pct: 52 },
  { n: 4, nom: 'The Underdogs', desc: 'Beaucoup de données non étiquetées, moins de données étiquetées', pct: 74 },
  { n: 5, nom: 'The Winners', desc: 'Données étiquetées et non étiquetées abondantes', pct: 100 },
]

export default function JoshiTaxonomyDiagram() {
  return (
    <div className="card-fx p-6" style={{ background: 'var(--sable)' }}>
      <div className="flex flex-col gap-4">
        {CLASSES.map((c, i) => {
          const isLow = i <= 1
          const isHigh = i === 5
          return (
            <div key={c.n} className="flex items-center gap-3">
              <div
                className="font-mono text-xs font-bold w-5 text-right flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {c.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                  <span className="font-ui text-xs font-semibold italic" style={{ color: 'var(--indigo)' }}>
                    « {c.nom} »
                  </span>
                  {isLow && (
                    <span
                      className="font-ui text-xs font-medium rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(234,88,12,0.12)', color: 'var(--argile)' }}
                    >
                      Langues prioritaires de FasoTALN
                    </span>
                  )}
                  {isHigh && (
                    <span
                      className="font-ui text-xs font-medium rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--mil)' }}
                    >
                      Anglais, français
                    </span>
                  )}
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'var(--sable-dark)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: isLow ? 'var(--argile)' : isHigh ? 'var(--mil)' : 'var(--or)',
                    }}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
