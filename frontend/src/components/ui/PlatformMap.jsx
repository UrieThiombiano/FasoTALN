import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Library, MapPin, Radar, FlaskConical, ArrowUpRight } from 'lucide-react'

/**
 * PlatformMap : plan animé de la plateforme, tel que présenté dans le rapport
 * (« Référentiel de capitalisation »). Un noeud central FasoTALN, quatre volets
 * qui se révèlent en cascade, connectés par un schéma qui se dessine.
 */

const PILLARS = [
  {
    num: '01',
    title: 'Référentiel de capitalisation',
    icon: Library,
    to: '/langues',
    blurb: "L'état de l'art du TALN africain, réuni et mis en perspective.",
    items: [
      { label: 'Langues africaines', to: '/langues' },
      { label: 'Défis du TALN africain', to: '/defis' },
      { label: 'Approches générales', to: '/approches' },
      { label: 'Ressources disponibles', to: '/ressources' },
    ],
  },
  {
    num: '02',
    title: 'Écosystème TALN-BF',
    icon: MapPin,
    to: '/ecosysteme',
    blurb: 'Le terrain burkinabè : institutions, langues nationales, feuilles de route.',
    items: [
      { label: 'Langues nationales du BF', to: '/ecosysteme' },
      { label: 'Acteurs du TALN-BF', to: '/ecosysteme' },
      { label: 'Initiatives et feuilles de route', to: '/ecosysteme' },
      { label: 'Ressources nationales', to: '/ecosysteme' },
    ],
  },
  {
    num: '03',
    title: 'Veille scientifique',
    icon: Radar,
    to: '/nouvelles',
    blurb: 'Deux agents qui gardent la plateforme à jour en continu.',
    items: [
      { label: 'Assistant de recherche' },
      { label: 'Agent de veille scientifique', to: '/nouvelles' },
    ],
  },
  {
    num: '04',
    title: 'Démonstrations interactives',
    icon: FlaskConical,
    to: '/contribution',
    blurb: 'Notre contribution AfriPhone, testable de bout en bout.',
    items: [
      { label: 'La contribution AfriPhone', to: '/contribution' },
      { label: 'Modèle G2P : texte vers IPA', to: '/demo-g2p' },
      { label: 'Pipeline de classification complet', to: '/pipeline' },
    ],
  },
]

const EASE = [0.22, 1, 0.36, 1]
const VIEWPORT = { once: true, amount: 0.15 }

const reveal = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.6, ease: EASE, delay },
})

const draw = (delay, axis) => {
  const key = axis === 'x' ? 'scaleX' : 'scaleY'
  return {
    initial: { [key]: 0 },
    whileInView: { [key]: 1 },
    viewport: VIEWPORT,
    transition: { duration: axis === 'x' ? 0.55 : 0.35, ease: EASE, delay },
  }
}

function Bullet() {
  return (
    <span
      className="flex-shrink-0 mt-1.5 rounded-full"
      style={{ width: 5, height: 5, background: 'var(--mil)' }}
    />
  )
}

export default function PlatformMap() {
  return (
    <section style={{ background: 'var(--sable)' }} className="py-20 md:py-24 overflow-hidden">
      <div className="container-fx">
        {/* En-tête */}
        <motion.div {...reveal(0)} className="text-center max-w-2xl mx-auto">
          <span className="badge badge-or mb-4">Le plan de la plateforme</span>
          <h2
            className="font-display text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--indigo)' }}
          >
            Quatre volets, une seule plateforme
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            De l'état de l'art au terrain burkinabè, de la veille automatisée aux
            démonstrations en direct : FasoTALN capitalise le TALN africain et le
            rend explorable.
          </p>
        </motion.div>

        {/* Noeud central + schéma */}
        <div className="flex flex-col items-center">
          <motion.div
            {...reveal(0.12, 12)}
            className="relative inline-flex items-center rounded-full px-6 py-2.5 mt-8 font-display font-bold text-lg"
            style={{
              color: '#fff',
              background: 'linear-gradient(135deg, var(--or-light), var(--or), var(--or-dark))',
              boxShadow: '0 14px 34px rgba(109,91,208,0.30)',
            }}
          >
            <span className="relative z-10">FasoTALN</span>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid var(--or)' }}
              animate={{ scale: [1, 1.4], opacity: [0.55, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            />
          </motion.div>

          {/* Connecteurs (bureau) : grille alignée sur les cartes */}
          <div className="relative hidden md:grid grid-cols-4 gap-5 w-full" style={{ height: 52 }} aria-hidden>
            <motion.div
              {...draw(0.26, 'y')}
              style={{
                position: 'absolute', top: 0, left: 'calc(50% - 1px)',
                width: 2, height: 26, background: 'var(--border)', transformOrigin: 'top',
              }}
            />
            <motion.div
              {...draw(0.38, 'x')}
              style={{
                position: 'absolute', top: 26, left: '12.5%', right: '12.5%',
                height: 2, background: 'var(--border)', transformOrigin: 'center',
              }}
            />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex justify-center">
                <motion.div
                  {...draw(0.5 + i * 0.04, 'y')}
                  style={{
                    marginTop: 26, width: 2, height: 26,
                    background: 'var(--border)', transformOrigin: 'top',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="md:hidden" style={{ height: 28 }} />
        </div>

        {/* Volets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            const base = 0.42 + i * 0.1
            return (
              <motion.div
                key={p.num}
                {...reveal(base, 30)}
                className="card-fx flex flex-col p-5 transition-transform hover:-translate-y-1"
                style={{ background: 'var(--blanc)' }}
              >
                <Link to={p.to} className="no-underline group">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(109,91,208,0.12)' }}
                    >
                      <Icon size={20} color="var(--or-dark)" strokeWidth={1.8} />
                    </div>
                    <span className="font-ui font-bold text-sm" style={{ color: 'var(--indigo-faint)' }}>
                      {p.num}
                    </span>
                  </div>
                  <h3
                    className="font-display text-base font-bold mb-1 flex items-center gap-1"
                    style={{ color: 'var(--indigo)' }}
                  >
                    {p.title}
                    <ArrowUpRight
                      size={15}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--or)' }}
                    />
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {p.blurb}
                  </p>
                </Link>

                <ul
                  className="flex flex-col gap-1.5 mt-3 pt-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  {p.items.map((it, j) => (
                    <motion.li key={it.label} {...reveal(base + 0.14 + j * 0.04, 8)}>
                      {it.to ? (
                        <Link
                          to={it.to}
                          className="flex items-start gap-2 text-sm no-underline hover:underline"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Bullet />
                          <span>{it.label}</span>
                        </Link>
                      ) : (
                        <span
                          className="flex items-start gap-2 text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Bullet />
                          <span>{it.label}</span>
                        </span>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
