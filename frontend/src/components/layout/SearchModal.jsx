import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { FLAT_PAGES } from '../../config/nav'

const SOURCES = [
  { category: 'languages', label: 'Langues', url: '/langues', map: (l) => ({ title: l.nom, excerpt: l.description }) },
  { category: 'challenges', label: 'Défis du TALN', url: '/defis', map: (c) => ({ title: c.titre, excerpt: c.description }) },
  { category: 'approaches', label: 'Approches', url: '/approches', map: (a) => ({ title: a.nom, excerpt: a.description }) },
  { category: 'resources', label: 'Ressources', url: '/ressources', map: (r) => ({ title: r.nom, excerpt: r.description }) },
  { category: 'perspectives', label: 'Perspectives', url: '/perspectives', map: (p) => ({ title: p.titre, excerpt: p.description }) },
]

const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function normalize(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
}

function useSearchIndex(enabled) {
  const [index, setIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || index || loading) return
    setLoading(true)
    Promise.all(
      SOURCES.map((s) =>
        fetch(`/api/knowledge/${s.category}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((items) => (Array.isArray(items) ? items : []).map((item) => ({ ...s.map(item), url: s.url, group: s.label })))
          .catch(() => [])
      )
    )
      .then((results) => {
        const pages = FLAT_PAGES.map((p) => ({ title: p.label, excerpt: p.group, url: p.to, group: 'Pages' }))
        setIndex(pages.concat(...results))
      })
      .finally(() => setLoading(false))
  }, [enabled, index, loading])

  return { index, loading }
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { index, loading } = useSearchIndex(open)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    if (!index || !query.trim()) return []
    const q = normalize(query)
    return index
      .filter((item) => normalize(item.title).includes(q) || normalize(item.excerpt).includes(q))
      .slice(0, 25)
  }, [index, query])

  function goTo(url) {
    onClose()
    navigate(url)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(31,33,41,0.5)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-24 z-[90] w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--blanc)', boxShadow: '0 24px 64px rgba(31,33,41,0.24)' }}>
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <Search size={18} color="var(--text-muted)" className="flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une langue, un défi, une ressource…"
                  className="flex-1 outline-none text-sm font-body bg-transparent"
                  style={{ color: 'var(--text-primary)' }}
                />
                {loading && <Loader2 size={16} className="animate-spin flex-shrink-0" color="var(--text-muted)" />}
                <button onClick={onClose} aria-label="Fermer la recherche" className="flex-shrink-0">
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {!query.trim() && (
                  <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                    Tapez pour rechercher dans les langues, défis, approches, ressources et perspectives.
                  </p>
                )}

                {query.trim() && results.length === 0 && !loading && (
                  <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                    Aucun résultat pour « {query} ».
                  </p>
                )}

                {results.map((r, i) => (
                  <button
                    key={`${r.url}-${r.title}-${i}`}
                    onClick={() => goTo(r.url)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/[0.03]"
                    style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-ui text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--or)' }}>
                          {r.group}
                        </span>
                      </div>
                      <div className="font-display font-bold text-sm mt-0.5" style={{ color: 'var(--indigo)' }}>
                        {r.title}
                      </div>
                      {r.excerpt && (
                        <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {r.excerpt}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} className="flex-shrink-0 mt-1" color="var(--text-muted)" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
