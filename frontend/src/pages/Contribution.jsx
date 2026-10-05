import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Waves, Network, Sparkles, Quote, Copy, Check } from 'lucide-react'
import RevealOnScroll from '../components/ui/RevealOnScroll'
import PipelineDiagram from '../components/ui/PipelineDiagram'
import DocsLayout from '../components/layout/DocsLayout'
import Callout from '../components/ui/Callout'

const BIBTEX = `@mastersthesis{thiombiano2026fasotaln,
  author  = {Thiombiano, Urie},
  title   = {Leveraging Phonemic Features for Cross-lingual NLP in African Languages},
  school  = {CITADEL -- Centre d'Excellence Interdisciplinaire en IA pour le D\\'eveloppement},
  year    = {2026},
  address = {Ouagadougou, Burkina Faso},
  note    = {FasoTALN, \\url{https://github.com/UrieThiombiano/fasoXplore}}
}`

export default function Contribution() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(BIBTEX)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DocsLayout
      title="Notre contribution"
      description="Leveraging Phonemic Features for Cross-lingual NLP in African Languages : exploiter les traits phonémiques pour rendre le TALN plus robuste aux variations orthographiques des langues nationales."
    >
      <div className="lesson-content">
        <RevealOnScroll>
          <span className="badge badge-or mb-4">Le problème</span>
          <h2 data-toc>Le texte brut ne suffit pas</h2>
          <p>
            Les modèles multilingues comme AfroXLMR apprennent des
            représentations à partir du texte orthographique. Or, comme
            détaillé dans <Link to="/defis" style={{ color: 'var(--or)' }}>les défis du TALN</Link>,
            les langues africaines couvertes par FasoTALN présentent des
            orthographes encore peu standardisées : un même mot peut s'écrire de
            plusieurs façons selon le locuteur, le support ou le contexte.
            Cette variabilité dégrade la qualité des représentations
            apprises par les modèles purement textuels.
          </p>
          <Callout variant="definition" title="Notre hypothèse">
            La transcription phonémique (IPA) d'un mot est plus stable que
            son orthographe, car elle capture sa prononciation réelle
            indépendamment des conventions d'écriture. Elle peut donc
            servir de signal complémentaire au texte pour les tâches de
            classification cross-lingue.
          </Callout>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 data-toc>Du texte à la classification hybride</h2>
          <p>
            Deux modèles enchaînés : un modèle G2P qui produit une
            transcription IPA, puis un classifieur qui exploite conjointement
            le texte et cette transcription.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <div className="rounded-2xl p-6 md:p-8 my-8" style={{ background: 'var(--sable)' }}>
          <PipelineDiagram />
        </div>
      </RevealOnScroll>

      <div className="lesson-content">
        <h2 data-toc>Les deux modèles</h2>

        <RevealOnScroll>
          <h3 className="flex items-center gap-2">
            <Waves size={18} color="var(--mil)" strokeWidth={1.8} />
            ByT5 : graphème vers phonème
          </h3>
          <p>
            Un ByT5-small fine-tuné, byte-level (sans tokenisation par mot),
            transcrit un texte en IPA pour le mooré, le dioula et le bambara.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h3 className="flex items-center gap-2">
            <Network size={18} color="var(--or)" strokeWidth={1.8} />
            AfroXLMR hybride
          </h3>
          <p>
            Un classifieur fondé sur AfroXLMR, entraîné sur SIB-200 et
            MasakhaNEWS avec une entrée combinant texte et IPA pour prédire
            l'une de 5 classes thématiques.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--or-dark)' }}>
          <Sparkles size={24} color="#FFFFFF" className="mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold mb-2 text-white">
            Voir le pipeline en action
          </h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Testez la transcription IPA seule, ou lancez le pipeline
            complet jusqu'à la classification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/demo-g2p"
              className="font-ui font-semibold text-sm inline-flex items-center gap-2 rounded-full px-7 py-3"
              style={{ border: '1.5px solid rgba(255,255,255,0.5)', color: '#FFFFFF' }}
            >
              Transcription en IPA (G2P)
            </Link>
            <Link
              to="/pipeline"
              className="font-ui font-semibold text-sm inline-flex items-center gap-2 rounded-full px-7 py-3"
              style={{ background: '#FFFFFF', color: 'var(--or-dark)' }}
            >
              Pipeline de classification <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <div id="citer" className="rounded-2xl p-6 md:p-8 my-8" style={{ border: '1px solid var(--border)', background: 'var(--sable)', scrollMarginTop: '6rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Quote size={16} color="var(--or-dark)" />
            <h3 className="font-display text-lg font-bold m-0" style={{ color: 'var(--indigo)' }}>
              Citer ce travail
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Si cette contribution vous est utile dans vos propres travaux de recherche, merci de la citer :
          </p>
          <div className="relative">
            <pre
              className="font-mono text-xs rounded-xl p-4 pr-28 overflow-x-auto"
              style={{ background: 'var(--blanc)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {BIBTEX}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-outline text-sm"
              style={{ padding: '0.4rem 1rem', position: 'absolute', top: 10, right: 10 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>
      </RevealOnScroll>
    </DocsLayout>
  )
}
