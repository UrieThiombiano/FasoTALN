import { Link } from 'react-router-dom'
import { Github, ExternalLink } from 'lucide-react'
import { FLAT_PAGES } from '../../config/nav'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--sable)', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
      <div className="container-fx py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Marque */}
        <div className="space-y-3">
          <span
            className="font-display font-bold text-xl"
            style={{
              background: 'linear-gradient(135deg, var(--or-light), var(--or), var(--or-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FasoTALN
          </span>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Portail scientifique et pédagogique du Traitement Automatique des
            Langues Naturelles (TALN) appliqué aux langues africaines, né à
            CITADEL (Burkina Faso).
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="font-ui font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--indigo)' }}>
            Explorer
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {FLAT_PAGES.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--or)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* À propos */}
        <div className="space-y-3">
          <h4 className="font-ui font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--indigo)' }}>
            À propos
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>
              FasoTALN est une initiative pour faire avancer le traitement
              automatique des langues africaines.
            </li>
            <li>Développé à CITADEL, Ouagadougou, en lien avec le réseau panafricain de recherche en TALN (Masakhane, AI4D Africa).</li>
            <li>
              <a
                href="https://github.com/UrieThiombiano/fasoXplore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--or)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Github size={15} /> Code source sur GitHub
              </a>
            </li>
            <li>
              <a
                href="https://huggingface.co/Uriath"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--or)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                Modèles sur Hugging Face <ExternalLink size={13} />
              </a>
            </li>
            <li>
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--or)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                Documentation de l'API (Swagger) <ExternalLink size={13} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="container-fx py-5 border-t text-xs text-center font-ui"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        FasoTALN · Le TALN des langues africaines · © 2026
      </div>
    </footer>
  )
}
