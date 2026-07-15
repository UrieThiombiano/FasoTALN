/**
 * Page Communiquer — Mode Immersion : parlez ou écrivez en français,
 * écoutez la traduction en mooré (pipeline ASR → MT → TTS).
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, Pause, Loader2, AlertTriangle, Square } from 'lucide-react'
import BogolonDivider from '../components/ui/BogolonDivider'
import RevealOnScroll from '../components/ui/RevealOnScroll'

// ── Lecture TTS à la demande : génère l'audio au premier clic, ────────────
// puis bascule lecture/pause sans re-générer.
function useTTSPlayer() {
  const [status, setStatus] = useState('idle') // idle | loading | ready | playing | error
  const audioRef = useRef(null)
  const urlRef = useRef(null)
  // Garde par ref plutôt que par état : reste fiable quand toggle() est appelé
  // juste après reset() dans le même gestionnaire d'événement (auto-lecture).
  const loadingRef = useRef(false)

  function cleanup() {
    if (audioRef.current) audioRef.current.pause()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    audioRef.current = null
    urlRef.current = null
  }

  function reset() {
    cleanup()
    loadingRef.current = false
    setStatus('idle')
  }

  useEffect(() => cleanup, [])

  async function toggle(text) {
    if (loadingRef.current || !text) return

    if (audioRef.current) {
      if (audioRef.current.paused) {
        setStatus('playing')
        audioRef.current.play().catch((e) => {
          if (e.name === 'AbortError') return
          cleanup()
          setStatus('error')
        })
      } else {
        audioRef.current.pause()
      }
      return
    }

    loadingRef.current = true
    setStatus('loading')
    try {
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!r.ok) throw new Error(`Échec de la synthèse vocale (${r.status})`)
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      urlRef.current = url

      const audio = new Audio(url)
      // pause/ended pilotent le retour à "ready" ; on ne fait pas dépendre
      // le statut de la promesse de play(), qui peut rester indéfiniment
      // "pending" dans certains contextes (politiques d'autoplay).
      audio.addEventListener('pause', () => setStatus('ready'))
      audio.addEventListener('ended', () => setStatus('ready'))
      audioRef.current = audio

      setStatus('playing')
      audio.play().catch((e) => {
        // AbortError : pause() a interrompu une promesse play() encore en attente
        // (ex. clic rapide play→pause) — comportement normal, pas une vraie erreur.
        if (e.name === 'AbortError') return
        cleanup()
        setStatus('error')
      })
    } catch {
      cleanup()
      setStatus('error')
    } finally {
      loadingRef.current = false
    }
  }

  return { status, toggle, reset }
}

function ImmersionPanel() {
  const [frText, setFrText] = useState('')
  const [moore, setMoore]   = useState('')
  // phase : idle | recording | transcribing | translating
  const [phase, setPhase]   = useState('idle')
  const [error, setError]   = useState(null)
  const tts = useTTSPlayer()

  const recorderRef = useRef(null)
  const chunksRef   = useRef([])
  const streamRef   = useRef(null)

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const busy = phase === 'transcribing' || phase === 'translating'
  const recording = phase === 'recording'

  async function startRecording() {
    setError(null)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError("Le micro n'est pas disponible sur ce navigateur.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      })
      recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []
        transcribe(blob)
      })
      recorderRef.current = recorder
      recorder.start()
      setPhase('recording')
    } catch {
      setError("Accès au micro refusé. Autorisez le micro ou écrivez votre phrase.")
      setPhase('idle')
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
      recorderRef.current = null
    }
  }

  async function transcribe(blob) {
    setPhase('transcribing')
    try {
      const form = new FormData()
      form.append('audio', blob, 'enregistrement.webm')
      form.append('lang', 'fra') // l'utilisateur parle français en mode immersion
      const r = await fetch('/api/asr', { method: 'POST', body: form })
      if (!r.ok) throw new Error(`La transcription a échoué (${r.status})`)
      const data = await r.json()
      const text = (data.transcription || '').trim()
      if (!text) {
        setError("Aucune parole détectée. Réessayez ou écrivez votre phrase.")
      } else {
        setFrText(text)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setPhase('idle')
    }
  }

  async function translateAndListen() {
    const text = frText.trim()
    if (!text || busy || recording) return

    setPhase('translating')
    setError(null)
    setMoore('')
    tts.reset()

    try {
      const r = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_lang: 'french', target_lang: 'moore' }),
      })
      if (!r.ok) throw new Error(`La traduction a échoué (${r.status})`)
      const data = await r.json()
      const translation = (data.translation || '').trim()
      if (!translation) throw new Error('Traduction vide reçue.')
      setMoore(translation)
      // Lecture automatique : cœur de la boucle d'immersion.
      tts.toggle(translation)
    } catch (e) {
      setError(e.message)
    } finally {
      setPhase('idle')
    }
  }

  const statusLabel = recording
    ? 'En écoute…'
    : phase === 'transcribing'
      ? 'Transcription en cours…'
      : phase === 'translating'
        ? 'Traduction en cours…'
        : null

  return (
    <div className="max-w-2xl">
      <label className="block font-ui text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Que souhaitez-vous dire ?
      </label>

      <div className="relative">
        <textarea
          value={frText}
          onChange={(e) => setFrText(e.target.value)}
          rows={4}
          disabled={recording || busy}
          placeholder="Parlez ou écrivez en français..."
          className="w-full p-4 pr-16 rounded-2xl outline-none resize-none text-base font-body"
          style={{
            background: 'var(--sable)',
            border: '2px solid var(--border)',
            color: 'var(--text-primary)',
            opacity: recording || busy ? 0.7 : 1,
          }}
        />

        {/* Bouton micro : enregistre, puis transcrit via /api/asr */}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={busy}
          className="absolute flex items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            top: 12,
            right: 12,
            width: 44,
            height: 44,
            background: recording ? 'var(--argile)' : 'var(--blanc)',
            border: `1.5px solid ${recording ? 'var(--argile)' : 'var(--border)'}`,
            color: recording ? '#fff' : 'var(--text-muted)',
          }}
          aria-label={recording ? "Arrêter l'enregistrement" : 'Parler en français'}
        >
          {recording && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid var(--argile)' }}
              animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          {recording ? <Square size={15} fill="currentColor" /> : <Mic size={18} />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 gap-3">
        <div className="flex items-center gap-2 text-xs font-ui min-h-[20px]" style={{ color: error ? 'var(--argile)' : 'var(--text-muted)' }}>
          {error && <AlertTriangle size={14} className="flex-shrink-0" />}
          {error || (statusLabel && (
            <>
              {recording
                ? <motion.span
                    className="inline-block rounded-full flex-shrink-0"
                    style={{ width: 8, height: 8, background: 'var(--argile)' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                : <Loader2 size={14} className="animate-spin flex-shrink-0" />}
              {statusLabel}
            </>
          ))}
        </div>

        <button
          onClick={translateAndListen}
          disabled={!frText.trim() || busy || recording}
          className="flex items-center gap-2 px-6 rounded-xl btn-or flex-shrink-0"
          style={{
            height: 44,
            opacity: !frText.trim() || busy || recording ? 0.6 : 1,
            cursor: !frText.trim() || busy || recording ? 'default' : 'pointer',
          }}
        >
          {phase === 'translating' ? <Loader2 size={15} className="animate-spin" /> : <Volume2 size={15} />}
          {phase === 'translating' ? 'Traduction en cours…' : 'Traduire et écouter'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {moore && (
          <motion.div
            key={moore}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-8 mt-8"
            style={{ background: 'var(--indigo)' }}
          >
            <span className="badge badge-or mb-4" style={{ display: 'inline-block' }}>
              En mooré
            </span>
            <p className="font-display text-3xl md:text-4xl mb-2" style={{ color: 'var(--or)', lineHeight: 1.3 }}>
              {moore}
            </p>
            <p className="text-sm font-body mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              « {frText.trim()} »
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => tts.toggle(moore)}
                disabled={tts.status === 'loading'}
                className="flex items-center gap-2 px-5 rounded-full font-ui font-medium text-sm transition-all"
                style={{
                  height: 42,
                  background: tts.status === 'playing' ? 'var(--or)' : 'transparent',
                  color: tts.status === 'playing' ? 'var(--indigo)' : 'var(--or)',
                  border: '1.5px solid var(--or)',
                  opacity: tts.status === 'loading' ? 0.7 : 1,
                }}
              >
                {tts.status === 'loading' && <Loader2 size={15} className="animate-spin" />}
                {tts.status === 'playing' && <Pause size={15} fill="currentColor" />}
                {(tts.status === 'idle' || tts.status === 'ready' || tts.status === 'error') && <Volume2 size={15} />}
                {tts.status === 'loading' ? 'Génération audio…' : tts.status === 'playing' ? 'Pause' : 'Réécouter'}
              </button>

              {tts.status === 'error' && (
                <span className="flex items-center gap-1.5 text-xs font-ui" style={{ color: 'var(--or-light)' }}>
                  <AlertTriangle size={13} />
                  Audio indisponible — le texte reste affiché.
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Phrases du jour : 3 salutations aléatoires tirées du phrasebook ────────
const fallbackPhrases = [
  { francais: 'Comment allez-vous ?', moore: 'Laafi bala ?', romanisation: 'La-a-fi ba-la' },
  { francais: 'Merci beaucoup', moore: 'Bark y wẽnam wʋsgo', romanisation: 'Bark i wê-nam wùs-go' },
  { francais: 'Bienvenue !', moore: 'Wend na kõ f yãmb zugu', romanisation: 'Wend na kõ f yãmb zu-gu' },
]

function PhrasesDuJour() {
  const [phrases, setPhrases] = useState(fallbackPhrases)

  useEffect(() => {
    let cancelled = false
    fetch('/api/phrasebook?situation=salutations')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        const list = Array.isArray(json.phrases) ? json.phrases : []
        if (list.length >= 3) {
          const shuffled = [...list].sort(() => Math.random() - 0.5)
          setPhrases(shuffled.slice(0, 3))
        }
      })
      .catch(() => {
        // API indisponible : les phrases par défaut restent affichées
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--sable)', borderRadius: 16 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)', marginBottom: '1rem' }}>
        Phrases essentielles en mooré
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {phrases.map((p, i) => (
          <motion.div
            key={p.moore || i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid var(--border)' }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{p.francais}</div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--argile)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              {p.moore}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>{p.romanisation}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Communiquer() {
  return (
    <div className="pt-20">
      <section className="hero-gradient py-20">
        <div className="container-fx text-center text-white">
          <RevealOnScroll>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Communiquer en mooré
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Traduisez, écoutez et parlez en mooré
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <BogolonDivider />

      <section className="py-16" style={{ background: 'var(--blanc)' }}>
        <div className="container-fx">
          <ImmersionPanel />
          <PhrasesDuJour />
        </div>
      </section>
    </div>
  )
}
