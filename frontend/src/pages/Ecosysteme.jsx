import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, ExternalLink, CheckCircle2, TrendingDown } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import StatTile from '../components/ui/StatTile'
import SourceList from '../components/ui/SourceList'
import Callout from '../components/ui/Callout'
import FamilyBarChart from '../components/ui/FamilyBarChart'
import FamilyCatalog from '../components/ui/FamilyCatalog'
import useKnowledge from '../hooks/useKnowledge'

const CHIFFRES_CLES = [
  { value: '2021', label: "Fondation de CITADEL, centre de recherche en IA à Ouagadougou" },
  { value: '59', label: 'langues nationales documentées par SIL Burkina Faso' },
  { value: '4', label: 'langues ciblées par le chantier IA du Ministère (mooré, dioula, fulfuldé, gulmancema)' },
  { value: '2026-2030', label: 'feuille de route nationale sur l’intelligence artificielle' },
]

function InstitutionCard({ inst, index }) {
  return (
    <motion.section
      className={index > 0 ? 'pt-8 mt-8 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)' } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm"
          style={{ background: 'rgba(109,91,208,0.12)', color: 'var(--or-dark)' }}
          aria-hidden
        >
          {inst.nom.charAt(0)}
        </div>
        <h3 className="font-display text-lg font-bold m-0" style={{ color: 'var(--indigo)' }}>
          {inst.nom}
        </h3>
      </div>
      {inst.nom_complet && (
        <div className="text-xs italic mb-3" style={{ color: 'var(--text-muted)' }}>
          {inst.nom_complet}
        </div>
      )}
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
        {inst.description}
      </p>
      {inst.details?.length > 0 && (
        <ul className="flex flex-col gap-2 mb-4">
          {inst.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" color="var(--mil)" />
              {d}
            </li>
          ))}
        </ul>
      )}
      {inst.lien && (
        <a
          href={inst.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-ui font-medium"
          style={{ color: 'var(--or)' }}
        >
          En savoir plus <ExternalLink size={13} />
        </a>
      )}
    </motion.section>
  )
}

function RoadmapItem({ item, index }) {
  return (
    <motion.section
      className={index > 0 ? 'pt-8 mt-8 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)' } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
    >
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <h3 className="font-display text-lg font-bold" style={{ color: 'var(--indigo)' }}>
          {item.titre}
        </h3>
        {item.date && <span className="badge badge-or">{item.date}</span>}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {item.texte}
      </p>
      <SourceList sources={item.sources} />
    </motion.section>
  )
}

export default function Ecosysteme() {
  const { data, loading, error } = useKnowledge('ecosysteme', { isList: false })

  return (
    <DocsLayout
      title="L'écosystème du TALN au Burkina Faso"
      description="Institutions, feuilles de route gouvernementales et pistes concrètes pour qui veut se spécialiser en traitement automatique des langues au Burkina Faso."
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
            Impossible de charger cette page.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.intro?.texte && (
            <div className="lesson-content">
              <p>{data.intro.texte}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-8">
            {CHIFFRES_CLES.map((c) => (
              <StatTile key={c.label} value={c.value} label={c.label} />
            ))}
          </div>

          {data.institutions?.length > 0 && (
            <>
              <div className="lesson-content">
                <h2 data-toc>Les institutions</h2>
              </div>
              {data.institutions.map((inst, i) => (
                <InstitutionCard key={inst.nom} inst={inst} index={i} />
              ))}
            </>
          )}

          {data.ressources_documentaires?.length > 0 && (
            <>
              <div className="lesson-content mt-12">
                <h2 data-toc>Ressources documentaires nationales</h2>
              </div>
              {data.ressources_documentaires.map((r, i) => (
                <InstitutionCard key={r.nom} inst={r} index={i} />
              ))}
            </>
          )}

          {data.contexte_national && (
            <div className="lesson-content mt-12">
              <h2 data-toc>Contexte linguistique national</h2>
              {data.contexte_national.intro && <p>{data.contexte_national.intro}</p>}

              {data.contexte_national.panorama_linguistique && (
                <>
                  <h3 data-toc>{data.contexte_national.panorama_linguistique.titre}</h3>
                  <p>{data.contexte_national.panorama_linguistique.texte}</p>
                  {data.contexte_national.panorama_linguistique.carte && (
                    <figure className="my-6">
                      <img
                        src={data.contexte_national.panorama_linguistique.carte}
                        alt="Carte de répartition des langues du Burkina Faso"
                        className="w-full rounded-2xl"
                        style={{ border: '1px solid var(--border)', background: 'var(--blanc)' }}
                        loading="lazy"
                      />
                      {data.contexte_national.panorama_linguistique.carte_credit && (
                        <figcaption className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          {data.contexte_national.panorama_linguistique.carte_credit}
                        </figcaption>
                      )}
                    </figure>
                  )}
                  {data.contexte_national.panorama_linguistique.vehiculaires_texte && (
                    <p>{data.contexte_national.panorama_linguistique.vehiculaires_texte}</p>
                  )}
                  <FamilyBarChart familles={data.contexte_national.panorama_linguistique.familles} />
                  <FamilyCatalog
                    familles={data.contexte_national.panorama_linguistique.familles}
                    source={data.contexte_national.panorama_linguistique.familles_source}
                  />
                </>
              )}

              {data.contexte_national.reforme_constitutionnelle_2023 && (
                <>
                  <h3 data-toc>La réforme constitutionnelle de 2023</h3>
                  <p>{data.contexte_national.reforme_constitutionnelle_2023.texte}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="rounded-xl p-4" style={{ background: 'var(--sable)', border: '1px solid var(--border)' }}>
                      <div className="font-ui text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                        Article 35 · {data.contexte_national.reforme_constitutionnelle_2023.ancien_article_35_reference}
                      </div>
                      <blockquote className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                        « {data.contexte_national.reforme_constitutionnelle_2023.ancien_article_35} »
                      </blockquote>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(109,91,208,0.06)', border: '1px solid var(--border)' }}>
                      <div className="font-ui text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--or-dark)' }}>
                        Article 35 · {data.contexte_national.reforme_constitutionnelle_2023.nouvel_article_35_reference}
                      </div>
                      <blockquote className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                        « {data.contexte_national.reforme_constitutionnelle_2023.nouvel_article_35} »
                      </blockquote>
                    </div>
                  </div>
                  {data.contexte_national.recensement_et_biais && (
                    <Callout variant="attention" title="Les chiffres du recensement, à lire avec prudence">
                      {data.contexte_national.recensement_et_biais.texte}
                    </Callout>
                  )}
                </>
              )}

              {data.contexte_national.langues_coloniales && (
                <>
                  <h3 data-toc>{data.contexte_national.langues_coloniales.titre}</h3>
                  <p>{data.contexte_national.langues_coloniales.texte}</p>
                </>
              )}

              {data.contexte_national.etat_recherche && (
                <>
                  <h3 data-toc>{data.contexte_national.etat_recherche.titre}</h3>
                  <p>{data.contexte_national.etat_recherche.texte}</p>
                  {data.contexte_national.etat_recherche.exemple && (
                    <Callout variant="example" title="Exemple">
                      {data.contexte_national.etat_recherche.exemple}
                    </Callout>
                  )}
                  {data.contexte_national.etat_recherche.impact && (
                    <p className="flex items-start gap-2 text-xs mt-3" style={{ color: 'var(--argile)' }}>
                      <TrendingDown size={14} className="flex-shrink-0 mt-0.5" />
                      <span style={{ color: 'var(--text-muted)' }}>{data.contexte_national.etat_recherche.impact}</span>
                    </p>
                  )}
                  <SourceList sources={data.contexte_national.etat_recherche.sources} />
                </>
              )}
            </div>
          )}

          {data.reseau_panafricain?.length > 0 && (
            <>
              <div className="lesson-content mt-12">
                <h2 data-toc>Le réseau panafricain</h2>
                <p>
                  FasoTALN n'agit pas seul : ces initiatives panafricaines
                  documentent, financent ou outillent la recherche en TALN
                  sur les langues à faibles ressources à l'échelle du
                  continent.
                </p>
              </div>
              {data.reseau_panafricain.map((inst, i) => (
                <InstitutionCard key={inst.nom} inst={inst} index={i} />
              ))}
            </>
          )}

          {data.feuille_de_route?.length > 0 && (
            <div className="lesson-content mt-12">
              <h2 data-toc>La feuille de route nationale</h2>
              {data.feuille_de_route.map((item, i) => (
                <RoadmapItem key={item.titre} item={item} index={i} />
              ))}
            </div>
          )}

          {data.se_specialiser && (
            <div className="lesson-content mt-4">
              <h2 data-toc>Comment se spécialiser</h2>
              <p>{data.se_specialiser.texte}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {data.se_specialiser.pistes.map((p) => (
                  <div key={p.titre} className="card-fx p-5">
                    <div className="font-display text-base font-bold mb-2" style={{ color: 'var(--indigo)' }}>
                      {p.titre}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {p.texte}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DocsLayout>
  )
}
