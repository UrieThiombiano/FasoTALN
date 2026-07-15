import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mic, BookOpen, Bot } from 'lucide-react'
import BogolonDivider from '../components/ui/BogolonDivider'
import RevealOnScroll from '../components/ui/RevealOnScroll'

const features = [
  {
    icon: BookOpen,
    color: 'var(--or)',
    title: 'Découvrir',
    desc: "Histoire, lieux mythiques, cultures et traditions. Le Burkina Faso raconté avec richesse.",
    to: '/decouvrir',
    badge: 'Histoire & Culture',
  },
  {
    icon: Mic,
    color: 'var(--argile)',
    title: 'Communiquer',
    desc: "Traduisez en mooré, apprenez des phrases essentielles, dialoguez vocalement.",
    to: '/communiquer',
    badge: 'Langue Mooré',
  },
  {
    icon: Bot,
    color: 'var(--mil)',
    title: 'FasoGuide',
    desc: "Posez vos questions librement. Notre agent IA connaît le Burkina sur le bout des doigts.",
    to: '/fasoquide',
    badge: 'Assistant IA',
  },
]

const stats = [
  { value: '8M+',  label: 'locuteurs mooré' },
  { value: '60+',  label: 'langues au Burkina' },
  { value: '3',    label: 'modules pour explorer' },
  { value: '100%', label: 'souverain et local' },
]

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="hero-gradient relative min-h-screen flex items-center pt-20"
        style={{ overflow: 'hidden' }}
      >
        {/* Cercles décoratifs d'ambiance */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: `
              radial-gradient(circle 600px at 75% 30%, rgba(240,165,0,0.07) 0%, transparent 70%),
              radial-gradient(circle 400px at 20% 80%, rgba(184,65,26,0.06) 0%, transparent 70%)
            `
          }}
        />

        <div className="container-fx relative py-20 md:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bogolan-divider-sm w-12 rounded-full" />
              <span
                className="font-ui font-semibold text-xs tracking-widest uppercase"
                style={{ color: 'var(--or)' }}
              >
                Burkina Faso · Pays des Hommes Intègres
              </span>
            </div>

            {/* Titre */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 text-white"
            >
              Découvrez le{' '}
              <em
                className="not-italic"
                style={{
                  background: 'linear-gradient(135deg, var(--or-light), var(--or), var(--argile-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Burkina Faso
              </em>{' '}
              autrement
            </h1>

            {/* Sous-titre */}
            <p
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.64)' }}
            >
              Histoire millénaire, cultures vivantes, langues nationales.
              FasoXplore vous plonge dans le cœur d'un pays que le monde
              ne connaît pas encore assez — avec des outils NLP inédits
              pour le mooré.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link to="/decouvrir" className="btn-or text-base">
                Commencer l'exploration
                <ArrowRight size={17} />
              </Link>
              <Link to="/fasoquide" className="btn-outline text-base">
                Parler à FasoGuide
              </Link>
            </div>
          </motion.div>
          </div>

          {/* Carte flottante : aperçu d'une conversation FasoGuide */}
          <div className="hidden lg:block flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(240,165,0,0.2)',
                borderRadius: 20,
                padding: '1.5rem',
                maxWidth: 340,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ color: 'var(--or)', fontFamily: 'var(--font-ui)', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                FasoGuide — Exemple
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <div style={{ background: 'var(--argile)', color: '#fff', padding: '10px 16px',
                  borderRadius: '18px 18px 4px 18px', fontSize: 13, maxWidth: '80%' }}>
                  Quoi visiter à Ouagadougou ?
                </div>
              </div>

              <div style={{ display: 'flex', marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                  padding: '10px 16px', borderRadius: '18px 18px 18px 4px', fontSize: 13, maxWidth: '90%' }}>
                  Le palais du Mogho Naaba chaque vendredi matin est incontournable !
                  Le Grand Marché et le SIAO valent aussi le détour…
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {[['8M+', 'Locuteurs'], ['60+', 'Langues'], ['3', 'Modules']].map(([val, lbl]) => (
                  <div key={lbl} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ color: 'var(--or)', fontFamily: 'var(--font-ui)',
                      fontWeight: 700, fontSize: 16 }}>{val}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </div>
        </div>

        {/* Vague de transition */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0 80L1440 80L1440 30C1200 80 960 0 720 20C480 40 240 80 0 30L0 80Z" fill="#FAF3E0" />
          </svg>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--sable)' }} className="py-14">
        <div className="container-fx">
          <RevealOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div
                    className="font-display text-4xl font-bold mb-1"
                    style={{ color: 'var(--argile)' }}
                  >
                    {s.value}
                  </div>
                  <div className="font-ui text-sm" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <BogolonDivider />

      {/* ── FONCTIONNALITÉS ───────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--blanc)' }}>
        <div className="container-fx">
          <RevealOnScroll>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="badge badge-or mb-4">Ce que fait FasoXplore</span>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-4"
                style={{ color: 'var(--indigo)' }}
              >
                Une plateforme, trois dimensions
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Du contenu éditorial riche à l'intelligence artificielle
                conversationnelle — tout pour vous connecter au Burkina Faso.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <RevealOnScroll key={f.title} delay={i * 0.1}>
                  <Link to={f.to} className="card-fx block p-6 h-full group no-underline">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${f.color}18` }}
                    >
                      <Icon size={22} color={f.color} strokeWidth={1.8} />
                    </div>
                    <span className="badge badge-or text-xs mb-3">{f.badge}</span>
                    <h3
                      className="font-display text-xl font-bold mb-2"
                      style={{ color: 'var(--indigo)' }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {f.desc}
                    </p>
                    <div
                      className="flex items-center gap-1 mt-4 text-sm font-ui font-medium group-hover:gap-2 transition-all"
                      style={{ color: f.color }}
                    >
                      Explorer <ArrowRight size={14} />
                    </div>
                  </Link>
                </RevealOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      <BogolonDivider />

      {/* ── CITATION ──────────────────────────────────────────────────── */}
      <section
        className="py-24 text-center"
        style={{ background: 'var(--indigo)' }}
      >
        <div className="container-fx max-w-3xl mx-auto">
          <RevealOnScroll>
            <div
              className="bogolan-divider-sm w-24 mx-auto mb-8 rounded-full"
              style={{ opacity: 0.4 }}
            />
            <blockquote
              className="font-display text-2xl md:text-3xl italic font-light leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              "Burkina Faso — le pays des hommes intègres. Un nom choisi
              en mooré et en dioula, deux langues, une vision."
            </blockquote>
            <p
              className="font-ui text-sm tracking-wider uppercase"
              style={{ color: 'var(--or)' }}
            >
              Thomas Sankara, 1984
            </p>
            <Link to="/decouvrir" className="btn-or" style={{ marginTop: '2rem' }}>
              Découvrir l'histoire du Burkina
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  )
}
