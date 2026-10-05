import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertTriangle, PlayCircle, Cpu, Network, FlaskConical, Languages } from 'lucide-react'
import LanguageSelector from '../components/ui/LanguageSelector'
import IPADisplay from '../components/ui/IPADisplay'
import ProbabilityBars from '../components/ui/ProbabilityBars'
import DocsLayout from '../components/layout/DocsLayout'

const REVEAL_DELAY_MS = 550

function StepBlock({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card-fx p-6"
    >
      <div className="font-ui text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--or)' }}>
        {title}
      </div>
      {children}
    </motion.div>
  )
}

export default function Pipeline() {
  const [lang, setLang]         = useState('mos')
  const [text, setText]         = useState('')
  const [status, setStatus]     = useState('idle') // idle | loading | revealing | error
  const [error, setError]       = useState(null)
  const [result, setResult]     = useState(null)
  const [revealStep, setRevealStep] = useState(0)

  const [frText, setFrText]         = useState('')
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState(null)

  useEffect(() => {
    if (status !== 'revealing') return
    if (revealStep >= 4) return
    const t = setTimeout(() => setRevealStep((s) => s + 1), REVEAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [status, revealStep])

  async function handleLaunch(e) {
    e.preventDefault()
    if (!text.trim() || status === 'loading') return
    setStatus('loading')
    setError(null)
    setResult(null)
    setRevealStep(0)
    try {
      const res = await fetch('/api/pipeline/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setResult(data)
      setStatus('revealing')
      setRevealStep(1)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  async function handleTranslate() {
    if (!frText.trim() || translating) return
    setTranslating(true)
    setTranslateError(null)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: frText }),
      })
      if (!res.ok) {
        throw new Error(res.status === 503 ? 'Traduction indisponible pour le moment.' : `Erreur ${res.status}`)
      }
      const data = await res.json()
      setText(data.translation)
    } catch (err) {
      setTranslateError(err.message)
    } finally {
      setTranslating(false)
    }
  }

  const busy = status === 'loading'

  return (
    <DocsLayout
      title="Pipeline de classification (texte + IPA)"
      description="Du texte à la classification : suivez chaque étape de notre pipeline hybride texte + IPA, en direct."
    >
      <div className="rounded-2xl p-6 md:p-8" style={{ border: '1.5px solid var(--or)', background: 'rgba(109,91,208,0.04)' }}>
        <div className="flex items-center gap-2 mb-6">
          <FlaskConical size={16} color="var(--or-dark)" />
          <span className="badge badge-or">Exercice interactif</span>
        </div>

        <form onSubmit={handleLaunch} className="flex flex-col gap-6">
          <div>
            <div className="font-ui text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              Langue
            </div>
            <LanguageSelector value={lang} onChange={setLang} disabled={busy} />
          </div>

          {lang === 'mos' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--sable)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Languages size={15} color="var(--or-dark)" />
                <span className="font-ui text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  Vous ne lisez pas le mooré ? Traduisez depuis le français
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={frText}
                  onChange={(e) => setFrText(e.target.value)}
                  disabled={busy || translating}
                  placeholder="Écrivez une phrase en français…"
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-body outline-none"
                  style={{ background: 'var(--blanc)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={!frText.trim() || busy || translating}
                  className="btn-outline text-sm"
                  style={{
                    padding: '0.5rem 1.25rem',
                    opacity: !frText.trim() || busy || translating ? 0.6 : 1,
                    cursor: !frText.trim() || busy || translating ? 'default' : 'pointer',
                  }}
                >
                  {translating ? <Loader2 size={15} className="animate-spin" /> : <Languages size={15} />}
                  Traduire en mooré
                </button>
              </div>
              {translateError && (
                <p className="text-xs mt-2" style={{ color: 'var(--argile)' }}>{translateError}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="pipeline-text" className="font-ui text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: 'var(--text-muted)' }}>
              Texte
            </label>
            <textarea
              id="pipeline-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
              rows={3}
              placeholder="Écrivez un texte à analyser…"
              className="w-full rounded-xl p-4 text-sm font-body resize-none outline-none"
              style={{ background: 'var(--blanc)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim() || busy}
            className="btn-or self-start"
            style={{ opacity: !text.trim() || busy ? 0.6 : 1, cursor: !text.trim() || busy ? 'default' : 'pointer' }}
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : <PlayCircle size={17} />}
            {busy ? 'Calcul en cours…' : 'Lancer la classification'}
          </button>
        </form>

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-6 p-4 rounded-xl text-sm"
            style={{ background: 'rgba(234,88,12,0.08)', color: 'var(--argile)' }}
          >
            <AlertTriangle size={16} />
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {result && status === 'revealing' && (
            <div className="flex flex-col gap-4 mt-8">
              {revealStep >= 1 && (
                <StepBlock title="Étape 1 : transcription IPA (ByT5)">
                  <IPADisplay ipa={result.ipa} label="" delimiters={false} />
                </StepBlock>
              )}

              {revealStep >= 2 && (
                <StepBlock title="Étape 2 : construction de l'entrée">
                  <div
                    className="font-mono text-sm rounded-xl p-4 break-words"
                    style={{ background: 'var(--sable)', color: 'var(--indigo)', border: '1px solid var(--border)' }}
                  >
                    {result.sequence}
                  </div>
                </StepBlock>
              )}

              {revealStep >= 3 && (
                <StepBlock title="Étape 3 : encodage AfroXLMR">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(22,163,74,0.12)' }}>
                      <Network size={18} color="var(--mil)" />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      L'entrée hybride est encodée par le classifieur AfroXLMR fine-tuné.
                    </p>
                  </div>
                </StepBlock>
              )}

              {revealStep >= 4 && (
                <StepBlock title="Étape 4 : classe prédite et probabilités">
                  <div className="flex items-center gap-2 mb-5">
                    <Cpu size={16} color="var(--or)" />
                    <span className="font-display text-lg font-bold" style={{ color: 'var(--indigo)' }}>
                      {result.predicted_label_fr}
                    </span>
                  </div>
                  <ProbabilityBars probabilities={result.probabilities_fr} predicted={result.predicted_label_fr} />
                </StepBlock>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </DocsLayout>
  )
}
