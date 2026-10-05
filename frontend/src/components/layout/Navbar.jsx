import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchModal from './SearchModal'

const groups = [
  { to: '/langues', label: 'Langues' },
  {
    label: 'TALN africain',
    items: [
      { to: '/glossaire', label: 'Glossaire' },
      { to: '/defis', label: 'Défis' },
      { to: '/approches', label: 'Approches actuelles' },
      { to: '/ressources', label: 'Ressources' },
    ],
  },
  {
    label: 'Approche phonémique',
    items: [
      { to: '/contribution', label: 'Notre contribution' },
      { to: '/demo-g2p', label: 'Transcription en IPA (G2P)' },
      { to: '/pipeline', label: 'Pipeline de classification (texte + IPA)' },
      { to: '/resultats', label: 'Résultats' },
      { to: '/perspectives', label: 'Perspectives de recherche' },
    ],
  },
  { to: '/ecosysteme', label: 'Écosystème TALN-BF' },
  { to: '/nouvelles', label: 'Actualités' },
]

function DesktopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className="px-4 py-2 rounded-lg font-ui font-medium text-sm transition-colors duration-200 hover:bg-black/[0.04]"
      style={({ isActive }) => ({ color: isActive ? 'var(--or)' : 'var(--text-primary)' })}
    >
      {label}
    </NavLink>
  )
}

function DesktopGroup({ label, items }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const location = useLocation()
  const isActive = items.some((i) => location.pathname === i.to)

  function show() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function hide() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className="flex items-center gap-1 px-4 py-2 rounded-lg font-ui font-medium text-sm transition-colors duration-200 hover:bg-black/[0.04]"
        style={{ color: isActive || open ? 'var(--or)' : 'var(--text-primary)' }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 py-2 rounded-xl min-w-[220px]"
            style={{
              background: 'var(--blanc)',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 32px rgba(31,33,41,0.12)',
            }}
          >
            {items.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  className="block px-4 py-2.5 font-ui text-sm transition-colors hover:bg-black/[0.03]"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--or)' : 'var(--text-primary)',
                  })}
                >
                  {i.label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen]             = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? '0 2px 16px rgba(31,33,41,0.06)' : 'none',
      }}
    >
      <nav className="container-fx flex items-center justify-between h-16 md:h-20">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className="font-display font-bold text-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--or-light), var(--or), var(--or-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FasoTALN
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex items-center gap-1">
            <li><DesktopLink to="/" label="Accueil" /></li>
            {groups.map((g) => (
              <li key={g.label}>
                {g.items ? <DesktopGroup {...g} /> : <DesktopLink to={g.to} label={g.label} />}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-sm transition-colors hover:bg-black/[0.04]"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            aria-label="Rechercher"
          >
            <Search size={15} />
            <span className="text-xs font-ui" style={{ color: 'var(--text-muted)' }}>/</span>
          </button>
        </div>

        {/* Mobile: recherche + burger */}
        <div className="md:hidden flex items-center gap-1">
          <button
            className="p-2 rounded-lg transition-colors hover:bg-black/[0.04]"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setSearchOpen(true)}
            aria-label="Rechercher"
          >
            <Search size={20} />
          </button>
          <button
            className="p-2 rounded-lg transition-colors hover:bg-black/[0.04]"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: 'var(--blanc)', borderTop: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="container-fx py-4 flex flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg font-ui font-medium transition-colors hover:bg-black/[0.04]"
                style={{ color: 'var(--text-primary)' }}
              >
                Accueil
              </NavLink>
              {groups.map((g) =>
                g.items ? (
                  <div key={g.label} className="pt-2">
                    <div
                      className="px-4 pb-1 font-ui text-xs font-semibold tracking-widest uppercase"
                      style={{ color: 'var(--or)' }}
                    >
                      {g.label}
                    </div>
                    {g.items.map((i) => (
                      <NavLink
                        key={i.to}
                        to={i.to}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 rounded-lg font-ui font-medium transition-colors hover:bg-black/[0.04]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {i.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink
                    key={g.to}
                    to={g.to}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg font-ui font-medium transition-colors hover:bg-black/[0.04]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {g.label}
                  </NavLink>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
