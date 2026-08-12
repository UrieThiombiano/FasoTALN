import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import RevealOnScroll from '../components/ui/RevealOnScroll'
import DocsLayout from '../components/layout/DocsLayout'
import Callout from '../components/ui/Callout'
import StatTile from '../components/ui/StatTile'

function useResults() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/results')
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((json) => { if (!cancelled) setData(json) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}

function pct(v) {
  return v === null || v === undefined ? '—' : `${(v * 100).toFixed(2)} %`
}

function pp(v) {
  return v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(2)} pts`
}

function LanguageBar({ value, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full relative overflow-hidden" style={{ height: 14, background: 'var(--sable-dark)' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-full"
          style={{ height: '100%', background: color }}
        />
      </div>
      <div className="font-ui text-sm font-semibold flex-shrink-0 text-right" style={{ width: 60, color: 'var(--text-primary)' }}>
        {(value * 100).toFixed(1)} %
      </div>
    </div>
  )
}

function ComparisonChart({ parLangue }) {
  if (!parLangue?.length) return null
  return (
    <div
      role="img"
      aria-label={`Comparaison F1 hybride vs texte seul par langue : ${parLangue
        .map((p) => `${p.langue} hybride ${(p.hybride_f1 * 100).toFixed(1)}%, texte seul ${(p.ortho_f1 * 100).toFixed(1)}%`)
        .join(' ; ')}`}
      className="my-6"
    >
      <div className="flex items-center gap-5 mb-5 font-ui text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: 'var(--or)' }} />
          Hybride (texte + IPA)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: 'var(--indigo-faint)' }} />
          Ortho (texte seul)
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {parLangue.map((p) => (
          <div key={p.code}>
            <div className="font-ui text-sm font-semibold mb-2" style={{ color: 'var(--indigo)' }}>
              {p.langue} <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>({p.code}) · {pp(p.gain_pp)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <LanguageBar value={p.hybride_f1} color="var(--or)" />
              <LanguageBar value={p.ortho_f1} color="var(--indigo-faint)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--sable)' }}>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-ui font-semibold text-xs tracking-wide uppercase px-5 py-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5" style={{ color: j === 0 ? 'var(--indigo)' : 'var(--text-primary)', fontWeight: j === 0 ? 600 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Resultats() {
  const { data, loading, error } = useResults()

  return (
    <DocsLayout
      title="Résultats"
      description="Résultats de la contribution FasoTALN : classification thématique 5 classes, texte hybride (texte + IPA) contre texte orthographique seul."
    >
      {loading && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
          style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--or)" />
          <p className="font-ui text-sm">Chargement…</p>
        </div>
      )}

      {!loading && error && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
          style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
        >
          <AlertTriangle size={28} color="var(--argile)" />
          <p className="font-ui text-sm">
            Impossible de charger les résultats.
            <br />
            <span style={{ color: 'var(--argile)' }}>{error}</span>
          </p>
        </div>
      )}

      {!loading && !error && data && (
        <div className="flex flex-col gap-10">
          {data.a_confirmer && (
            <RevealOnScroll>
              <Callout variant="attention" title="Résultats à confirmer">
                {data.note || 'Résultats à confirmer.'}
              </Callout>
            </RevealOnScroll>
          )}

          {!data.a_confirmer && data.note && (
            <RevealOnScroll>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {data.note}
              </p>
            </RevealOnScroll>
          )}

          {data.global && (
            <RevealOnScroll>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatTile value={pct(data.global.hybride_f1)} label="F1 hybride — résultat global" />
                <StatTile value={pct(data.global.ortho_f1)} label="F1 texte seul — résultat global" />
                <StatTile value={pp(data.global.gain_pp)} label="Gain global de l'approche hybride" />
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll>
            <h2 data-toc className="font-display text-xl font-bold mb-4" style={{ color: 'var(--indigo)' }}>
              Résultats par langue
            </h2>
            <ComparisonChart parLangue={data.par_langue} />
            <Table
              headers={['Langue', 'F1 hybride', 'F1 texte seul', 'Gain']}
              rows={data.par_langue.map((p) => [
                <div key="l">
                  <div>{p.langue}</div>
                  <div className="text-xs font-normal font-mono" style={{ color: 'var(--text-muted)' }}>{p.code}</div>
                </div>,
                pct(p.hybride_f1),
                pct(p.ortho_f1),
                pp(p.gain_pp),
              ])}
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <Callout variant="note" title="Un résultat à nuancer pour le dioula">
              L'approche hybride améliore nettement les résultats pour le mooré
              (+4,57 pts) et surtout le bambara (+9,73 pts), mais fait
              légèrement moins bien que le texte seul pour le dioula (−0,32
              pt) — un écart faible, mais qui montre que le gain apporté par
              la transcription phonémique n'est pas uniforme selon la langue,
              et mérite d'être creusé plutôt que passé sous silence.
            </Callout>
          </RevealOnScroll>
        </div>
      )}
    </DocsLayout>
  )
}
