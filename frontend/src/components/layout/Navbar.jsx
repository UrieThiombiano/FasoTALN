import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/fasoXplore-crop.png'

const links = [
  { to: '/',            label: 'Accueil', end: true },
  { to: '/decouvrir',   label: 'Découvrir' },
  { to: '/communiquer', label: 'Communiquer' },
  { to: '/fasoquide',   label: 'FasoGuide' },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(26,18,48,0.97)' : 'rgba(26,18,48,0.85)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(240,165,0,0.15)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <nav className="container-fx flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="FasoXplore"
            style={{ height: 44, borderRadius: 10, display: 'block' }}
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-ui font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-or bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`
                }
                style={({ isActive }) => isActive ? { color: 'var(--or)' } : { color: 'rgba(255,255,255,0.72)' }}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: 'rgba(26,18,48,0.98)', backdropFilter: 'blur(16px)' }}
          >
            <ul className="container-fx py-4 flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg font-ui font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
