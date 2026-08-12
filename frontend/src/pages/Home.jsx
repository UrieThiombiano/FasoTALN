import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Languages, BookOpen, AlertCircle, Layers, Database,
  FlaskConical, Wand2, PlayCircle, BarChart3, Compass, Building2,
  FileCode, Github, Cpu, Quote, Newspaper,
} from 'lucide-react'
import BogolonDivider from '../components/ui/BogolonDivider'
import RevealOnScroll from '../components/ui/RevealOnScroll'
import { FLAT_PAGES } from '../config/nav'

const STEP_ICONS = {
  '/langues': Languages,
  '/glossaire': BookOpen,
  '/defis': AlertCircle,
  '/approches': Layers,
  '/ressources': Database,
  '/contribution': FlaskConical,
  '/demo-g2p': Wand2,
  '/pipeline': PlayCircle,
  '/resultats': BarChart3,
  '/perspectives': Compass,
  '/ecosysteme': Building2,
  '/nouvelles': Newspaper,
}

export default function Home() {
  const [resourceCount, setResourceCount] = useState(27)
  const [results, setResults] = useState(null)

  useEffect(() => {
    fetch('/api/knowledge/resources')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setResourceCount(data.length) })
      .catch(() => {})

    fetch('/api/results')
      .then((r) => r.json())
      .then(setResults)
      .catch(() => {})
  }, [])

  const stats = [
    { value: '5',            label: 'langues africaines prioritaires' },
    { value: `${resourceCount}`, label: 'ressources cataloguées' },
    { value: '5',            label: 'classes thématiques (pipeline)' },
    { value: '3',            label: 'langues avec modèle G2P + classification' },
  ]

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
              radial-gradient(circle 600px at 75% 30%, rgba(109,91,208,0.07) 0%, transparent 70%),
              radial-gradient(circle 400px at 20% 80%, rgba(22,163,74,0.05) 0%, transparent 70%)
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
                Traitement Automatique des Langues Naturelles · Afrique
              </span>
            </div>

            {/* Titre */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6"
              style={{ color: 'var(--indigo)' }}
            >
              Le TALN au service des{' '}
              <em
                className="not-italic"
                style={{
                  background: 'linear-gradient(135deg, var(--or-light), var(--or), var(--or-dark))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                langues africaines
              </em>
            </h1>

            {/* Sous-titre */}
            <p
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: 'var(--text-muted)' }}
            >
              Les langues africaines restent largement absentes des grands
              modèles de langue. FasoTALN est le portail de référence sur le
              TALN appliqué aux langues africaines — né à CITADEL, à
              Ouagadougou, autour de cinq langues d'ancrage (mooré, dioula,
              fulfuldé, gourmantché, bambara), et conçu pour s'élargir
              progressivement à d'autres langues du continent. Défis,
              ressources, approches et contributions de recherche, dans une
              seule plateforme qui évolue avec la communauté.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link to="/defis" className="btn-or text-base">
                Découvrir les enjeux
                <ArrowRight size={17} />
              </Link>
              <Link to="/pipeline" className="btn-outline text-base">
                Tester le pipeline
              </Link>
            </div>
          </motion.div>
          </div>

          {/* Photo + carte flottante : chercheurs africains en IA, aperçu du pipeline */}
          <div className="hidden lg:flex lg:flex-col gap-5 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="rounded-2xl overflow-hidden"
              style={{ maxWidth: 340, boxShadow: '0 20px 48px rgba(31,33,41,0.10)' }}
            >
              <img
                src="/images/home/citadel-1.jpg"
                alt="Session de formation CITADEL, présentatrice au micro devant un tableau de notes sur l'éthique de l'IA"
                className="w-full h-44 object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                background: 'var(--blanc)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '1.5rem',
                maxWidth: 340,
                boxShadow: '0 20px 48px rgba(31,33,41,0.08)',
              }}
            >
              <div style={{ color: 'var(--or)', fontFamily: 'var(--font-ui)', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Notre pipeline
              </div>

              <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: 12.5, lineHeight: 1.9 }}>
                <div>"laafi bala"</div>
                <div style={{ color: 'var(--or)' }}>↓ ByT5</div>
                <div>[la.a.fi ba.la]</div>
                <div style={{ color: 'var(--or)' }}>↓ AfroXLMR</div>
                <div>classe : <span style={{ color: 'var(--mil)' }}>santé (0.81)</span></div>
              </div>

              <div style={{ display: 'flex', gap: 16, paddingTop: 16, marginTop: 16,
                borderTop: '1px solid var(--border)' }}>
                {[['3', 'Langues'], ['5', 'Classes'], ['2', 'Modèles']].map(([val, lbl]) => (
                  <div key={lbl} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ color: 'var(--or)', fontFamily: 'var(--font-ui)',
                      fontWeight: 700, fontSize: 16 }}>{val}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{lbl}</div>
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
            <path d="M0 80L1440 80L1440 30C1200 80 960 0 720 20C480 40 240 80 0 30L0 80Z" fill="#F7F7FB" />
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
                    style={{ color: 'var(--or)' }}
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

      {/* ── POURQUOI CE PROJET ──────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--blanc)' }}>
        <div className="container-fx">
          <RevealOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <span className="badge badge-or mb-4">Pourquoi FasoTALN</span>
                <h2
                  className="font-display text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: 'var(--indigo)' }}
                >
                  Des langues parlées par des millions,
                  invisibles pour l'IA
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }} className="mb-4">
                  Le mooré, le dioula et le bambara sont parlés par plus de 30
                  millions de personnes en Afrique de l'Ouest. Pourtant, elles
                  restent quasiment absentes des grands modèles de langue :
                  peu de corpus, peu de données annotées, peu de modèles
                  dédiés.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  FasoTALN rassemble en un seul endroit les enjeux, les
                  ressources, les approches et les contributions de recherche
                  nécessaires pour combler cet écart — un point d'entrée
                  pensé pour durer et s'enrichir avec la communauté.
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 16px 40px rgba(31,33,41,0.08)' }}>
                  <img
                    src="/images/home/citadel-u-auben-19-min-1024x394.jpeg"
                    alt="Salle de formation CITADEL, participants avec ordinateurs portables en session de travail"
                    className="w-full h-52 object-cover"
                  />
                </div>
                <div className="card-fx p-8" style={{ background: 'var(--sable)' }}>
                <h3 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--indigo)' }}>
                  Notre mission
                </h3>
                <ul className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {[
                    'Expliquer simplement ce qu\'est le TALN et pourquoi il compte',
                    'Documenter les défis scientifiques propres aux langues africaines',
                    'Cataloguer les ressources et modèles déjà disponibles',
                    'Présenter des contributions concrètes, testables en direct',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-1.5 rounded-full" style={{ width: 6, height: 6, background: 'var(--mil)' }} />
                      {t}
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="badge badge-or mb-4">Parcours d'apprentissage</span>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-4"
                style={{ color: 'var(--indigo)' }}
              >
                Du concept à la démonstration
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {FLAT_PAGES.length} étapes, des langues elles-mêmes jusqu'à un
                pipeline de recherche que vous pouvez tester en direct.
              </p>
            </div>
          </RevealOnScroll>

          <div className="max-w-2xl mx-auto relative">
            <div
              className="absolute left-6 top-6 bottom-6 w-px hidden sm:block"
              style={{ background: 'var(--border)' }}
              aria-hidden
            />
            <div className="flex flex-col gap-2">
              {FLAT_PAGES.map((page, i) => {
                const Icon = STEP_ICONS[page.to] || Compass
                return (
                  <RevealOnScroll key={page.to} delay={Math.min(i * 0.05, 0.4)}>
                    <Link
                      to={page.to}
                      className="relative flex items-center gap-4 p-3 rounded-xl group no-underline transition-colors hover:bg-black/[0.03]"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-ui font-bold z-10"
                        style={{ background: 'var(--or)', color: '#FFFFFF' }}
                      >
                        {i + 1}
                      </div>
                      <Icon size={18} className="flex-shrink-0" color="var(--or-dark)" strokeWidth={1.8} />
                      <div className="flex-1 min-w-0">
                        <div className="font-ui text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          {page.group}
                        </div>
                        <div className="font-display text-lg font-bold" style={{ color: 'var(--indigo)' }}>
                          {page.label}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--or)' }}
                      />
                    </Link>
                  </RevealOnScroll>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <BogolonDivider />

      {/* ── RÉSULTATS ────────────────────────────────────────────────── */}
      {results && (
        <section className="py-24" style={{ background: 'var(--sable)' }}>
          <div className="container-fx">
            <RevealOnScroll>
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="badge badge-or mb-4">Résultats</span>
                <h2
                  className="font-display text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: 'var(--indigo)' }}
                >
                  L'hybride texte + phonèmes, ça marche
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Comparaison en {results.metrique}, entre un classifieur
                  entraîné sur le texte orthographique seul et le même modèle
                  entraîné sur l'entrée hybride texte + IPA.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="card-fx p-8 max-w-2xl mx-auto mb-10" style={{ background: 'var(--blanc)' }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-ui text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {results.global.label}
                  </span>
                  <span className="badge" style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--mil)' }}>
                    +{results.global.gain_pp.toFixed(1)} pts
                  </span>
                </div>
                {[
                  ['Hybride (texte + IPA)', results.global.hybride_f1, 'var(--or)'],
                  ['Texte seul', results.global.ortho_f1, 'var(--text-muted)'],
                ].map(([label, val, color], i) => (
                  <div key={label} className="mb-4 last:mb-0">
                    <div className="flex justify-between font-ui text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      <span>{label}</span>
                      <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {(val * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 10, background: 'var(--sable-dark)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${val * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        style={{ height: '100%', background: color, borderRadius: 999 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              {results.par_langue.map((l, i) => (
                <RevealOnScroll key={l.langue} delay={Math.min(i * 0.08, 0.3)}>
                  <div className="card-fx p-5 text-center h-full" style={{ background: 'var(--blanc)' }}>
                    <div className="font-display font-bold mb-2" style={{ color: 'var(--indigo)' }}>
                      {l.langue}
                    </div>
                    <div className="font-mono text-2xl font-bold mb-1" style={{ color: 'var(--or-dark)' }}>
                      {(l.hybride_f1 * 100).toFixed(1)}%
                    </div>
                    <div className="font-ui text-xs" style={{ color: l.gain_pp >= 0 ? 'var(--mil)' : 'var(--argile)' }}>
                      {l.gain_pp >= 0 ? '+' : ''}{l.gain_pp.toFixed(2)} pts vs texte seul
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <div className="text-center">
              <Link to="/resultats" className="btn-outline text-base">
                Voir la méthodologie complète <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ÉCOSYSTÈME ───────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--blanc)' }}>
        <div className="container-fx">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <RevealOnScroll>
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 48px rgba(31,33,41,0.10)' }}>
                <img
                  src="/images/home/student-researcher.png"
                  alt="Étudiant-chercheur lors d'une cérémonie de remise de diplômes"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </RevealOnScroll>

            <div>
              <RevealOnScroll>
                <span className="badge badge-or mb-4">Écosystème</span>
                <h2
                  className="font-display text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: 'var(--indigo)' }}
                >
                  Ancré dans une communauté de recherche réelle
                </h2>
                <p style={{ color: 'var(--text-muted)' }} className="mb-6">
                  FasoTALN s'inscrit dans un écosystème actif, du centre de
                  recherche burkinabè aux initiatives panafricaines qui font
                  avancer le TALN des langues à faibles ressources.
                </p>
              </RevealOnScroll>

              <RevealOnScroll>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['CITADEL', 'Masakhane', 'AI4D Africa', 'Lacuna Fund'].map((nom) => (
                    <div
                      key={nom}
                      className="flex items-center gap-2 rounded-full px-4 py-2"
                      style={{ background: 'var(--sable)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                        style={{ background: 'rgba(109,91,208,0.15)', color: 'var(--or-dark)' }}
                        aria-hidden
                      >
                        {nom.charAt(0)}
                      </div>
                      <span className="font-ui text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {nom}
                      </span>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>

              <Link to="/ecosysteme" className="btn-outline text-base">
                Explorer l'écosystème <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── POUR LES CHERCHEURS ──────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--sable)' }}>
        <div className="container-fx">
          <RevealOnScroll>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="badge badge-or mb-4">Pour les chercheurs</span>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-4"
                style={{ color: 'var(--indigo)' }}
              >
                Réutilisez, intégrez, citez
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                FasoTALN n'est pas qu'une vitrine : modèles, code et
                méthodologie sont ouverts et réutilisables dans vos propres
                travaux.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { Icon: FileCode, label: 'Documentation API', desc: 'Swagger interactif', href: '/docs', external: true },
              { Icon: Github, label: 'Code source', desc: 'Dépôt GitHub', href: 'https://github.com/UrieThiombiano/fasoXplore', external: true },
              { Icon: Cpu, label: 'Modèles', desc: 'Hugging Face', href: 'https://huggingface.co/Uriath', external: true },
              { Icon: Quote, label: 'Citer ce travail', desc: 'BibTeX', href: '/contribution#citer', external: false },
            ].map(({ Icon, label, desc, href, external }, i) => (
              <RevealOnScroll key={label} delay={Math.min(i * 0.08, 0.3)}>
                {external ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-fx p-5 flex flex-col items-center text-center gap-2 no-underline transition-transform hover:-translate-y-1 h-full"
                    style={{ background: 'var(--blanc)' }}
                  >
                    <Icon size={22} color="var(--or-dark)" />
                    <div className="font-ui font-semibold text-sm" style={{ color: 'var(--indigo)' }}>{label}</div>
                    <div className="font-ui text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                  </a>
                ) : (
                  <Link
                    to={href}
                    className="card-fx p-5 flex flex-col items-center text-center gap-2 no-underline transition-transform hover:-translate-y-1 h-full"
                    style={{ background: 'var(--blanc)' }}
                  >
                    <Icon size={22} color="var(--or-dark)" />
                    <div className="font-ui font-semibold text-sm" style={{ color: 'var(--indigo)' }}>{label}</div>
                    <div className="font-ui text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                  </Link>
                )}
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <BogolonDivider />

      {/* ── CITATION ──────────────────────────────────────────────────── */}
      <section
        className="py-24 text-center"
        style={{ background: 'var(--or-dark)' }}
      >
        <div className="container-fx max-w-3xl mx-auto">
          <RevealOnScroll>
            <div
              className="bogolan-divider-sm w-24 mx-auto mb-8 rounded-full"
              style={{ opacity: 0.5 }}
            />
            <blockquote
              className="font-display text-2xl md:text-3xl italic font-light leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              "Masakhane — nous construisons ensemble. Par les Africains,
              pour les Africains."
            </blockquote>
            <p
              className="font-ui text-sm tracking-wider uppercase"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Devise du mouvement panafricain Masakhane NLP
            </p>
            <p
              className="text-sm leading-relaxed mt-6 max-w-xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              FasoTALN s'inscrit dans cet esprit collectif : documenter,
              outiller et faire avancer le TALN pour l'ensemble des langues
              africaines.
            </p>
            <Link
              to="/langues"
              className="font-ui font-semibold text-sm inline-flex items-center gap-2 rounded-full px-7 py-3"
              style={{ marginTop: '2rem', background: '#FFFFFF', color: 'var(--or-dark)' }}
            >
              Découvrir les langues africaines
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  )
}
