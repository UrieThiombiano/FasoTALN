import { Link } from 'react-router-dom'
import { Compass, ArrowRight, Home as HomeIcon } from 'lucide-react'
import { NAV } from '../config/nav'

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center" style={{ background: 'var(--sable)' }}>
      <div className="container-fx py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(109,91,208,0.12)' }}
        >
          <Compass size={28} color="var(--or)" strokeWidth={1.8} />
        </div>

        <div className="font-display text-6xl md:text-7xl font-bold mb-3" style={{ color: 'var(--indigo)' }}>
          404
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--indigo)' }}>
          Cette page n'existe pas
        </h1>
        <p className="text-base max-w-lg mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
          L'adresse demandée ne correspond à aucun contenu de FasoTALN. Elle a
          peut-être été déplacée, ou l'URL contient une erreur.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <Link to="/" className="btn-or">
            <HomeIcon size={17} /> Retour à l'accueil
          </Link>
          <Link to="/langues" className="btn-outline">
            Explorer les langues nationales
          </Link>
        </div>

        <div className="max-w-2xl mx-auto text-left">
          <div
            className="font-ui text-xs font-semibold uppercase tracking-wide mb-4 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            Ou parcourir une section
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NAV.map((g) => (
              <div key={g.group} className="card-fx p-4">
                <div className="font-ui text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--or)' }}>
                  {g.group}
                </div>
                <ul className="flex flex-col gap-1">
                  {g.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center gap-1.5 text-sm no-underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <ArrowRight size={12} className="flex-shrink-0" color="var(--text-muted)" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
