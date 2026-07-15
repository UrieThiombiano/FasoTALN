/**
 * VirtualVisit — mode "Visite Virtuelle" immersif plein écran pour un lieu.
 *
 * Trois scènes narratives (titre / description / conseil local) sur fond
 * d'image animée en Ken Burns. Navigation entre scènes, navigation entre
 * lieux sans quitter le mode, fermeture par Echap ou bouton X, et passerelle
 * vers FasoGuide avec question préremplie.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X, MapPin, Info, Calendar, Lightbulb, Bot,
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,
} from 'lucide-react'
import { lieuxImages } from '../../assets/index.js'

const TOTAL_SCENES = 3

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

function SceneTitle({ lieu, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <motion.h2
        {...fadeUp}
        transition={{ duration: 0.6 }}
        className="font-display font-bold"
        style={{ fontSize: 'clamp(2.25rem, 7vw, 4rem)', color: 'var(--or)', lineHeight: 1.1 }}
      >
        {lieu.nom}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center gap-2 font-ui text-sm uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        <MapPin size={15} />
        {lieu.region}{lieu.type ? ` — ${lieu.type}` : ''}
      </motion.p>
      <motion.button
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="btn-or mt-4"
        onClick={onContinue}
      >
        Continuer
      </motion.button>
    </div>
  )
}

function SceneDescription({ lieu }) {
  const highlights = lieu.incontournables || []
  return (
    <div className="flex flex-col items-center text-center gap-5" style={{ maxWidth: 600 }}>
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 font-ui text-xs uppercase tracking-widest"
        style={{ color: 'var(--or)' }}
      >
        <span className="flex items-center gap-1.5"><MapPin size={13} />{lieu.region}</span>
        {lieu.type && <span className="flex items-center gap-1.5"><Info size={13} />{lieu.type}</span>}
      </motion.div>

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="font-body text-white"
        style={{ fontSize: '1.05rem', lineHeight: 1.8 }}
      >
        {lieu.description}
      </motion.p>

      {highlights.length > 0 && (
        <motion.ul
          className="flex flex-col items-start gap-2"
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -16 }}
          variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
        >
          {highlights.map((h, i) => (
            <motion.li
              key={i}
              variants={{
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
              }}
              className="flex items-center gap-3 font-ui text-sm"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <span
                className="flex-shrink-0 rounded-full"
                style={{ width: 6, height: 6, background: 'var(--or)' }}
              />
              {h}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}

function SceneConseil({ lieu, onAskGuide }) {
  return (
    <div className="flex flex-col items-center text-center gap-5" style={{ maxWidth: 600 }}>
      {lieu.conseil && (
        <>
          <motion.span
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full font-ui text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'var(--or)', color: 'var(--indigo)' }}
          >
            <Lightbulb size={13} />
            Conseil local
          </motion.span>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-body text-white"
            style={{ fontSize: '1.05rem', lineHeight: 1.8 }}
          >
            {lieu.conseil}
          </motion.p>
        </>
      )}

      {lieu.meilleur_moment && (
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-2 font-ui text-sm"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <Calendar size={15} color="var(--or)" />
          Meilleur moment : {lieu.meilleur_moment}
        </motion.p>
      )}

      <motion.button
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="btn-or mt-2"
        onClick={onAskGuide}
      >
        <Bot size={16} />
        Demander à FasoGuide
      </motion.button>
    </div>
  )
}

export default function VirtualVisit({ lieu, lieux, onClose, onChangeLieu }) {
  const [scene, setScene] = useState(1)
  const navigate = useNavigate()

  const index = lieux.findIndex((l) => l.id === lieu.id)
  const image = lieuxImages[lieu.id]

  // Nouvelle visite → retour à la première scène
  useEffect(() => {
    setScene(1)
  }, [lieu.id])

  // Fermeture par Echap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bloquer le scroll de la page derrière l'overlay
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  function goToLieu(offset) {
    if (lieux.length < 2) return
    const next = (index + offset + lieux.length) % lieux.length
    onChangeLieu(lieux[next])
  }

  function askGuide() {
    onClose()
    navigate('/fasoquide', { state: { question: `Dis-m'en plus sur ${lieu.nom}` } })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', overflow: 'hidden' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Visite virtuelle : ${lieu.nom}`}
    >
      {/* Image plein écran en Ken Burns */}
      <AnimatePresence>
        {image ? (
          <motion.img
            key={lieu.id}
            src={image}
            alt={lieu.nom}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.12], x: [0, -20] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' },
              x: { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' },
            }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', transformOrigin: 'center',
            }}
          />
        ) : (
          <motion.div
            key={`${lieu.id}-fallback`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-gradient"
            style={{ position: 'absolute', inset: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Voile global + gradient bas pour la lisibilité */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        }}
      />

      {/* Barre de progression */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
        <motion.div
          style={{ height: 3, background: 'var(--or)', transformOrigin: 'left' }}
          initial={false}
          animate={{ scaleX: scene / TOTAL_SCENES }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Fermer */}
      <button
        onClick={onClose}
        aria-label="Fermer la visite"
        className="flex items-center justify-center rounded-full transition-colors"
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 2,
          width: 44, height: 44,
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <X size={20} />
      </button>

      {/* Contenu narratif */}
      <div
        className="px-6"
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingBottom: 150,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lieu.id}-${scene}`}
            className="flex justify-center w-full"
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {scene === 1 && <SceneTitle lieu={lieu} onContinue={() => setScene(2)} />}
            {scene === 2 && <SceneDescription lieu={lieu} />}
            {scene === 3 && <SceneConseil lieu={lieu} onAskGuide={askGuide} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation scènes + lieux */}
      <div
        className="px-6 pb-6 flex flex-col items-center gap-4"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}
      >
        {/* Scènes : précédent / indicateurs / suivant */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setScene((s) => Math.max(1, s - 1))}
            disabled={scene === 1}
            aria-label="Scène précédente"
            className="flex items-center justify-center rounded-full transition-opacity"
            style={{
              width: 38, height: 38,
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              opacity: scene === 1 ? 0.3 : 1,
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setScene(s)}
                aria-label={`Scène ${s}`}
                className="rounded-full transition-all"
                style={{
                  width: s === scene ? 22 : 8,
                  height: 8,
                  background: s === scene ? 'var(--or)' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setScene((s) => Math.min(TOTAL_SCENES, s + 1))}
            disabled={scene === TOTAL_SCENES}
            aria-label="Scène suivante"
            className="flex items-center justify-center rounded-full transition-opacity"
            style={{
              width: 38, height: 38,
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              opacity: scene === TOTAL_SCENES ? 0.3 : 1,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Lieux : précédent / position / suivant */}
        {lieux.length > 1 && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => goToLieu(-1)}
              aria-label="Lieu précédent"
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <span className="font-ui text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {index + 1} / {lieux.length} — {lieu.nom}
            </span>
            <button
              onClick={() => goToLieu(1)}
              aria-label="Lieu suivant"
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
