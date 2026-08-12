import { motion } from 'framer-motion'

/**
 * probabilities: { label: number } (0..1), somme ~1
 * predicted: label prédit (mis en avant)
 */
export default function ProbabilityBars({ probabilities, predicted }) {
  const entries = Object.entries(probabilities || {}).sort((a, b) => b[1] - a[1])
  const max = entries.length ? entries[0][1] : 1

  return (
    <div role="table" aria-label="Probabilités par classe" className="flex flex-col gap-3">
      {entries.map(([label, value], i) => {
        const isPredicted = label === predicted
        const pct = Math.round(value * 100)
        return (
          <div key={label} role="row" className="flex items-center gap-3">
            <div
              role="cell"
              className="font-ui text-sm flex-shrink-0"
              style={{
                width: 130,
                color: isPredicted ? 'var(--indigo)' : 'var(--text-muted)',
                fontWeight: isPredicted ? 600 : 500,
              }}
            >
              {label}
            </div>
            <div
              role="cell"
              className="flex-1 rounded-full relative overflow-hidden"
              style={{ height: 12, background: 'var(--sable-dark)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: isPredicted ? 'var(--or)' : 'var(--indigo-faint)',
                  opacity: isPredicted ? 1 : 0.45,
                }}
              />
            </div>
            <div
              role="cell"
              className="font-mono text-sm flex-shrink-0 text-right"
              style={{ width: 48, color: isPredicted ? 'var(--or)' : 'var(--text-muted)', fontWeight: isPredicted ? 600 : 400 }}
            >
              {pct}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
