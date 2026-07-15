import { Link } from 'react-router-dom'
import logo from '../../assets/fasoXplore-crop.png'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--indigo)', color: 'rgba(255,255,255,0.55)' }}>
      <div className="bogolan-divider" />
      <div className="container-fx py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Marque */}
        <div className="space-y-3">
          <div className="flex items-center">
            <img
              src={logo}
              alt="FasoXplore"
              style={{ height: 40, borderRadius: 8, display: 'block' }}
            />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Plateforme de découverte du Burkina Faso — histoire, culture,
            patrimoine et langues nationales.
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="font-ui font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--or)' }}>
            Explorer
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              ['/decouvrir', 'Découvrir le Burkina'],
              ['/communiquer', 'Communiquer en mooré'],
              ['/fasoquide', 'FasoGuide IA'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* À propos */}
        <div className="space-y-3">
          <h4 className="font-ui font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--or)' }}>
            À propos
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <li>
              FasoXplore est une initiative pour valoriser la culture
              et les langues du Burkina Faso.
            </li>
            <li>Développé à CITADEL, Ouagadougou.</li>
          </ul>
        </div>
      </div>

      <div
        className="container-fx py-5 border-t text-xs text-center font-ui"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
      >
        FasoXplore — Découvrir le Burkina Faso autrement © 2026
      </div>
    </footer>
  )
}
