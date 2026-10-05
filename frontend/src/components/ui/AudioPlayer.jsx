import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * AudioPlayer : lecteur audio sur mesure, design FasoXplore.
 * Props :
 *   src       : URL ou blob URL du fichier audio
 *   label     : texte affiché à côté du bouton (optionnel)
 *   compact   : si true, affiche seulement le bouton play (sans barre de progression)
 *   dark      : si true, couleurs pour fond sombre (hero/indigo)
 */
export default function AudioPlayer({ src, label, compact = false, dark = false }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !src) return
    audio.src = src

    const onEnd = () => setPlaying(false)
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1))
    const onLoad = () => setDuration(audio.duration)

    audio.addEventListener('ended', onEnd)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoad)
    return () => {
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoad)
    }
  }, [src])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  function seek(e) {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * (audio.duration || 0)
  }

  const iconColor = dark ? 'var(--indigo)' : 'var(--blanc)'
  const bgColor   = dark ? 'var(--or)' : 'rgba(240,165,0,0.85)'

  if (compact) {
    return (
      <>
        <audio ref={audioRef} preload="none" />
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ width: 40, height: 40, background: bgColor, flexShrink: 0 }}
          aria-label={playing ? 'Mettre en pause' : 'Écouter'}
        >
          {playing
            ? <Pause size={16} color={iconColor} fill={iconColor} />
            : <Play  size={16} color={iconColor} fill={iconColor} style={{ marginLeft: 2 }} />
          }
        </button>
      </>
    )
  }

  const trackBg   = dark ? 'rgba(26,18,48,0.15)' : 'rgba(255,255,255,0.15)'
  const labelColor = dark ? 'var(--text-primary)' : 'rgba(255,255,255,0.72)'

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} preload="none" />

      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-full flex-shrink-0 transition-transform active:scale-95 hover:brightness-110"
        style={{ width: 40, height: 40, background: bgColor }}
        aria-label={playing ? 'Mettre en pause' : 'Écouter'}
      >
        {playing
          ? <Pause size={16} color={iconColor} fill={iconColor} />
          : <Play  size={16} color={iconColor} fill={iconColor} style={{ marginLeft: 2 }} />
        }
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        {label && (
          <span className="block text-sm font-ui truncate" style={{ color: labelColor }}>
            {label}
          </span>
        )}
        <div
          className="w-full h-1.5 rounded-full cursor-pointer"
          style={{ background: trackBg }}
          onClick={seek}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--or)', originX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {duration > 0 && (
        <span className="text-xs font-ui flex-shrink-0" style={{ color: labelColor }}>
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>
      )}

      <Volume2 size={14} style={{ color: labelColor, flexShrink: 0 }} />
    </div>
  )
}
