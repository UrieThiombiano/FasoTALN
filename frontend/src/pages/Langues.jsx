import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, Waves, MapPin, Loader2, AlertTriangle, ArrowRight, Info } from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import Callout from '../components/ui/Callout'
import StatTile from '../components/ui/StatTile'
import SourceList from '../components/ui/SourceList'
import FamilyBarChart from '../components/ui/FamilyBarChart'
import FamilyCatalog from '../components/ui/FamilyCatalog'
import useKnowledge from '../hooks/useKnowledge'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="flex-shrink-0 mt-0.5" color="var(--or)" />
      <div>
        <div className="font-ui text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  )
}

function LanguageSection({ lang, index }) {
  return (
    <motion.section
      className={index > 0 ? 'pt-10 mt-10 border-t' : ''}
      style={index > 0 ? { borderColor: 'var(--border)' } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
    >
      <div className="flex items-baseline gap-3 flex-wrap mb-3">
        <h2 data-toc className="font-display text-2xl font-bold" style={{ color: 'var(--indigo)' }}>
          {lang.nom}
        </h2>
        {lang.nom_local && lang.nom_local !== lang.nom && (
          <span className="font-body italic text-sm" style={{ color: 'var(--text-muted)' }}>
            « {lang.nom_local} »
          </span>
        )}
      </div>

      {lang.image && (
        <figure className="mb-5">
          <img
            src={lang.image}
            alt={lang.image_alt || lang.nom}
            className="w-full rounded-2xl object-cover"
            style={{ maxHeight: 340, border: '1px solid var(--border)' }}
            loading="lazy"
          />
          {lang.image_credit && (
            <figcaption className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {lang.image_credit}
            </figcaption>
          )}
        </figure>
      )}

      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
        {lang.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-5">
        <InfoRow icon={Users} label="Locuteurs" value={lang.locuteurs} />
        <InfoRow icon={BookOpen} label="Famille" value={`${lang.famille} · ${lang.sous_famille}`} />
        <InfoRow icon={Waves} label="Tons & écriture" value={`${lang.tons} · ${lang.ecriture}`} />
        <InfoRow icon={MapPin} label="Zone géographique" value={lang.zone_geographique} />
      </div>

      {lang.particularites?.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 mb-5">
          <span className="font-ui text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            Particularités :
          </span>
          {lang.particularites.map((p, i) => (
            <span key={i} className={`badge ${['badge-or', 'badge-mil', 'badge-argile'][i % 3]}`}>
              {p}
            </span>
          ))}
        </p>
      )}

      {lang.exemples?.length > 0 && (
        <Callout variant="example" title="Exemples">
          <ul className="space-y-1.5">
            {lang.exemples.map((ex, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-mono" style={{ color: 'var(--indigo)' }}>{ex.mot}</span>
                <span style={{ color: 'var(--text-muted)' }}>{ex.traduction_fr}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}

      {lang.tester_g2p ? (
        <Link to={`/demo-g2p?lang=${lang.code}`} className="btn-outline">
          Tester la transcription IPA <ArrowRight size={15} />
        </Link>
      ) : (
        <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Info size={13} className="flex-shrink-0" />
          Pas encore de démonstration G2P pour cette langue sur cette plateforme.
        </p>
      )}
    </motion.section>
  )
}

function LoadingBlock() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
      style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
    >
      <Loader2 size={28} className="animate-spin" color="var(--or)" />
      <p className="font-ui text-sm">Chargement…</p>
    </div>
  )
}

function ErrorBlock({ message, label }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
      style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
    >
      <AlertTriangle size={28} color="var(--argile)" />
      <p className="font-ui text-sm">
        Impossible de charger {label}.
        <br />
        <span style={{ color: 'var(--argile)' }}>{message}</span>
      </p>
    </div>
  )
}

export default function Langues() {
  const { data: langues, loading: loadingLangues, error: errorLangues } = useKnowledge('languages')
  const { data: ctx, loading: loadingCtx, error: errorCtx } = useKnowledge('languages_context', { isList: false })

  const loading = loadingLangues || loadingCtx
  const error = errorLangues || errorCtx

  return (
    <DocsLayout
      title="Les langues africaines"
      description="Un panorama de la diversité linguistique du continent africain et de la fracture numérique qui la traverse en TALN, et des langues africaines déjà couvertes par FasoTALN (mooré, dioula, fulfuldé, gourmantché et bambara), un point de départ appelé à s'élargir à d'autres langues du continent. Le contexte institutionnel propre au Burkina Faso (réforme constitutionnelle, recensement) est traité sur la page Écosystème TALN-BF."
    >
      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} label="les langues" />}

      {!loading && !error && (
        <>
          {ctx?.vue_ensemble && (
            <div className="lesson-content">
              <h2 data-toc>Panorama linguistique</h2>
              <p>{ctx.vue_ensemble.texte}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                <StatTile value="1 500-3 000" label="langues parlées en Afrique (UNESCO)" />
                <StatTile value="1/3" label="des langues du monde sont africaines" />
                <StatTile value="4" label="grands ensembles linguistiques" />
              </div>
              <SourceList sources={ctx.vue_ensemble.sources} />
            </div>
          )}

          {ctx?.familles && (
            <div className="lesson-content">
              <h2 data-toc>Les quatre grands ensembles linguistiques du continent</h2>
              <p>
                Ces familles sont d'une taille radicalement inégale : le
                Niger-Congo, à lui seul, regroupe plus de langues que les
                trois autres réunis. La liste de langues sous chaque famille
                est une sélection d'exemples notables, pas un inventaire
                exhaustif.
              </p>
            </div>
          )}
          <FamilyBarChart familles={ctx?.familles} />
          <FamilyCatalog familles={ctx?.familles} source={ctx?.familles_source} />

          {ctx?.fracture_numerique && (
            <div className="lesson-content mt-10">
              <h2 data-toc>{ctx.fracture_numerique.titre}</h2>
              <p>{ctx.fracture_numerique.texte}</p>
              <SourceList sources={ctx.fracture_numerique.sources} />
            </div>
          )}

          {ctx?.couverture_taln && (
            <div className="lesson-content mt-10">
              <h2 data-toc>{ctx.couverture_taln.titre}</h2>
              <p>{ctx.couverture_taln.texte}</p>
              <SourceList sources={ctx.couverture_taln.sources} />
            </div>
          )}

          <div className="lesson-content mt-10">
            <h2 data-toc>Cinq langues pour commencer</h2>
            {ctx?.langues_couvertes_intro && <p>{ctx.langues_couvertes_intro.texte}</p>}
          </div>
          {langues.map((lang, i) => (
            <LanguageSection key={lang.id} lang={lang} index={i} />
          ))}
        </>
      )}
    </DocsLayout>
  )
}
