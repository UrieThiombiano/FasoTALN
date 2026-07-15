import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Users, Utensils, Calendar,
  Tag, Lightbulb, Sparkles, Loader2, AlertTriangle,
} from 'lucide-react'
import BogolonDivider from '../components/ui/BogolonDivider'
import RevealOnScroll from '../components/ui/RevealOnScroll'
import VirtualVisit from '../components/ui/VirtualVisit'
import { lieuxImages } from '../assets/index.js'

const tabs = [
  { id: 'histoire',    label: 'Histoire',     icon: Clock },
  { id: 'lieux',       label: 'Lieux',         icon: MapPin },
  { id: 'culture',     label: 'Culture',       icon: Users },
  { id: 'gastronomie', label: 'Gastronomie',   icon: Utensils },
  { id: 'festivals',   label: 'Festivals',     icon: Calendar },
]

const badgeClasses = ['badge-or', 'badge-mil', 'badge-argile']

// Sujet de l'invitation FasoGuide affichée sous chaque catégorie
const invitations = {
  histoire:    "l'histoire du Burkina Faso",
  lieux:       'les lieux à découvrir',
  culture:     'la culture burkinabè',
  gastronomie: 'la gastronomie burkinabè',
  festivals:   'les festivals du pays',
}

// ── Normalisation des champs (chaque catégorie JSON a sa propre forme) ─────
function getTitle(item) {
  return item.titre || item.nom || item.id
}
function getDescription(item) {
  return item.resume || item.description || ''
}
function getTip(item, category) {
  return item.conseil || item.pourquoi_y_aller || (category !== 'histoire' && category !== 'culture' ? item.detail : null)
}
function getMeta(item) {
  return item.periode || item.frequence || item.meilleur_moment || null
}
function getSubtitle(item) {
  return item.region || item.type || item.lieu || null
}
function getHighlights(item) {
  return item.incontournables || item.accompagnement || null
}

// ── Cache module-level : évite de recharger une catégorie déjà visitée ─────
const cache = {}

function useKnowledge(category) {
  const [data, setData] = useState(cache[category] || null)
  const [loading, setLoading] = useState(!cache[category])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache[category]) {
      setData(cache[category])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/knowledge/${category}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Catégorie introuvable (${r.status})`)
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        const list = Array.isArray(json) ? json : []
        cache[category] = list
        setData(list)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category])

  return { data: data || [], loading, error }
}

function KnowledgeCard({ item, category, index, onVisit }) {
  const subtitle    = getSubtitle(item)
  const meta        = getMeta(item)
  const highlights  = getHighlights(item)
  const tip         = getTip(item, category)
  const tags        = item.tags || []
  const image       = category === 'lieux' ? lieuxImages[item.id] : undefined

  return (
    <motion.article
      className="card-fx flex flex-col h-full overflow-hidden"
      style={{ padding: 0 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      {image && (
        <div className="flex-shrink-0 h-[150px] sm:h-[200px]" style={{ overflow: 'hidden' }}>
          <img
            src={image}
            alt={getTitle(item)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)' }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 ${image ? 'p-5' : 'p-6'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {getTitle(item)}
        </h3>
        {item.chiffre && (
          <div className="flex-shrink-0 text-right">
            <Sparkles size={14} color="var(--or-dark)" />
          </div>
        )}
      </div>

      {subtitle && (
        <span
          className="badge badge-or mb-3"
          style={{ alignSelf: 'flex-start' }}
        >
          {subtitle}
        </span>
      )}

      <p className="font-body text-sm mb-4 flex-1" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
        {getDescription(item)}
      </p>

      {highlights && highlights.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {highlights.slice(0, 4).map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs font-ui"
              style={{ color: 'var(--text-primary)' }}
            >
              <span
                className="flex-shrink-0 mt-1 rounded-full"
                style={{ width: 5, height: 5, background: 'var(--mil)' }}
              />
              {h}
            </li>
          ))}
        </ul>
      )}

      {meta && (
        <div className="flex items-center gap-2 mb-3 text-xs font-ui" style={{ color: 'var(--argile)' }}>
          <Calendar size={13} />
          {meta}
        </div>
      )}

      {item.chiffre && (
        <div className="flex items-center gap-2 mb-3 text-xs font-ui font-semibold" style={{ color: 'var(--or-dark)' }}>
          <Sparkles size={13} />
          {item.chiffre}
        </div>
      )}

      {tip && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs font-body"
          style={{ background: 'var(--sable)', color: 'var(--text-primary)' }}
        >
          <Lightbulb size={14} className="flex-shrink-0 mt-0.5" color="var(--or-dark)" />
          {tip}
        </div>
      )}

      {onVisit && (
        <button
          className="btn-or mb-4"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => onVisit(item)}
        >
          Visiter ce lieu
        </button>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Tag size={13} color="var(--text-muted)" className="mt-1" />
          {tags.map((tag, i) => (
            <span key={i} className={`badge ${badgeClasses[i % badgeClasses.length]}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
      </div>
    </motion.article>
  )
}

export default function Decouvrir() {
  const [active, setActive] = useState('histoire')
  const [visitingLieu, setVisitingLieu] = useState(null)
  const { data, loading, error } = useKnowledge(active)

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="hero-gradient py-20">
        <div className="container-fx text-center text-white">
          <RevealOnScroll>
            <div className="bogolan-divider-sm w-16 mx-auto mb-6 rounded-full" />
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Découvrir le Burkina Faso
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Un pays façonné par des siècles d'histoire, de cultures et de traditions vivantes.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <BogolonDivider />

      {/* Onglets */}
      <section className="py-16" style={{ background: 'var(--blanc)' }}>
        <div className="container-fx">
          {/* Navigation onglets */}
          <div className="flex flex-wrap gap-2 mb-12 border-b" style={{ borderColor: 'var(--border)' }}>
            {tabs.map((t) => {
              const Icon = t.icon
              const isActive = active === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className="flex items-center gap-2 px-5 py-3 font-ui font-medium text-sm transition-all relative"
                  style={{
                    color: isActive ? 'var(--argile)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--argile)' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Contenu */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {loading && (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
                  style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
                >
                  <Loader2 size={28} className="animate-spin" color="var(--argile)" />
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
                    Impossible de charger cette catégorie.
                    <br />
                    <span style={{ color: 'var(--argile)' }}>{error}</span>
                  </p>
                </div>
              )}

              {!loading && !error && data.length === 0 && (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
                  style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
                >
                  <p className="font-ui text-sm">Aucun contenu disponible pour cette catégorie pour l'instant.</p>
                </div>
              )}

              {!loading && !error && data.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item, i) => (
                      <KnowledgeCard
                        key={item.id || i}
                        item={item}
                        category={active}
                        index={i}
                        onVisit={active === 'lieux' ? setVisitingLieu : undefined}
                      />
                    ))}
                  </div>

                  {/* Invitation à poursuivre avec FasoGuide */}
                  <div
                    style={{
                      marginTop: '3rem', textAlign: 'center',
                      padding: '2rem', background: 'var(--sable)', borderRadius: 16,
                    }}
                  >
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Vous avez des questions sur {invitations[active] || 'le Burkina Faso'} ?
                    </p>
                    <Link to="/fasoquide" className="btn-or">
                      Demander à FasoGuide
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Mode Visite Virtuelle — overlay plein écran */}
      <AnimatePresence>
        {visitingLieu && (
          <VirtualVisit
            lieu={visitingLieu}
            lieux={data}
            onClose={() => setVisitingLieu(null)}
            onChangeLieu={setVisitingLieu}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
