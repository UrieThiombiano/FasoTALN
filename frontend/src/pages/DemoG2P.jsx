import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, Wand2, FlaskConical, FileText, Cpu, Waves, ArrowRight } from 'lucide-react'
import LanguageSelector, { LANGUAGES } from '../components/ui/LanguageSelector'
import IPADisplay from '../components/ui/IPADisplay'
import DocsLayout from '../components/layout/DocsLayout'

export default function DemoG2P() {
  const [params] = useSearchParams()
  const initialLang = LANGUAGES.some((l) => l.code === params.get('lang')) ? params.get('lang') : 'mos'

  const [lang, setLang]       = useState(initialLang)
  const [text, setText]       = useState('')
  const [ipa, setIpa]         = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setIpa(null)
    try {
      const res = await fetch('/api/g2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setIpa(data.ipa)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DocsLayout
      title="Transcription phonétique (G2P)"
      description="Transcrivez un texte en Alphabet Phonétique International (IPA) grâce à notre modèle ByT5 fine-tuné."
    >
      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8 flex-wrap">
        {[
          { icon: FileText, label: 'Texte', color: 'var(--mil)' },
          { icon: Cpu, label: 'ByT5 (G2P)', color: 'var(--or)' },
          { icon: Waves, label: 'IPA', color: 'var(--argile)' },
        ].map(({ icon: Icon, label, color }, i, arr) => (
          <div key={label} className="flex items-center gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <span className="font-ui text-xs font-semibold" style={{ color: 'var(--indigo)' }}>{label}</span>
            </div>
            {i < arr.length - 1 && <ArrowRight size={18} color="var(--text-muted)" className="flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6 md:p-8" style={{ border: '1.5px solid var(--or)', background: 'rgba(109,91,208,0.04)' }}>
        <div className="flex items-center gap-2 mb-6">
          <FlaskConical size={16} color="var(--or-dark)" />
          <span className="badge badge-or">Exercice interactif</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <div className="font-ui text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              Langue
            </div>
            <LanguageSelector value={lang} onChange={setLang} disabled={loading} />
          </div>

          <div>
            <label htmlFor="g2p-text" className="font-ui text-xs font-semibold tracking-widest uppercase mb-3 block" style={{ color: 'var(--text-muted)' }}>
              Texte
            </label>
            <textarea
              id="g2p-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Écrivez un texte à transcrire…"
              className="w-full rounded-xl p-4 text-sm font-body resize-none outline-none"
              style={{ background: 'var(--blanc)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="btn-or self-start"
            style={{ opacity: !text.trim() || loading ? 0.6 : 1, cursor: !text.trim() || loading ? 'default' : 'pointer' }}
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
            {loading ? 'Transcription…' : 'Transcrire en IPA'}
          </button>
        </form>

        {error && (
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

        {ipa !== null && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <IPADisplay ipa={ipa} />
          </motion.div>
        )}
      </div>
    </DocsLayout>
  )
}
