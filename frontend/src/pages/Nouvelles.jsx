import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, AlertTriangle, ExternalLink, Newspaper,
  FlaskConical, Cpu, Database, CalendarDays, Landmark,
} from 'lucide-react'
import DocsLayout from '../components/layout/DocsLayout'
import RevealOnScroll from '../components/ui/RevealOnScroll'

const CATEGORY_ICONS = {
  'Recherche': FlaskConical,
  'Modèle': Cpu,
  'Jeu de données': Database,
  'Conférence': CalendarDays,
  'Financement': Landmark,
}

const CATEGORY_COLORS = {
  'Recherche': 'var(--or)',
  'Modèle': 'var(--mil)',
  'Jeu de données': 'var(--argile)',
  'Conférence': 'var(--or-dark)',
  'Financement': 'var(--indigo)',
}

function useNews() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/news')
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((json) => { if (!cancelled) setData(json) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}

function formatDate(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return null
  }
}

function NewsCard({ item, index }) {
  const Icon = CATEGORY_ICONS[item.categorie] || Newspaper
  const color = CATEGORY_COLORS[item.categorie] || 'var(--or)'
  const date = formatDate(item.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      className="card-fx p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold rounded-full px-3 py-1"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={13} />
          {item.categorie}
        </span>
        {date && (
          <span className="font-ui text-xs" style={{ color: 'var(--text-muted)' }}>
            {date}
          </span>
        )}
      </div>

      <h3 className="font-display text-base font-bold mb-2 leading-snug" style={{ color: 'var(--indigo)' }}>
        {item.titre}
      </h3>

      <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>
        {item.resume}
      </p>

      <a
        href={item.source_lien}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold"
        style={{ color: 'var(--or)' }}
      >
        {item.source_nom} <ExternalLink size={12} />
      </a>
    </motion.div>
  )
}

export default function Nouvelles() {
  const { data, loading, error } = useNews()

  return (
    <DocsLayout
      title="Nouvelles du jour"
      description="Actualités récentes du TALN en Afrique (nouvelles approches, modèles, jeux de données, conférences), recherchées et résumées automatiquement, sourcées à chaque fois."
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
            Impossible de charger les actualités.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && data?.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
          style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
        >
          <Newspaper size={28} color="var(--or)" />
          <p className="font-ui text-sm">Pas encore d'actualités, revenez bientôt.</p>
        </div>
      )}

      {!loading && !error && data?.length > 0 && (
        <RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.map((item, i) => (
              <NewsCard key={item.source_lien} item={item} index={i} />
            ))}
          </div>
        </RevealOnScroll>
      )}
    </DocsLayout>
  )
}
