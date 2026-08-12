import { motion } from 'framer-motion'

export default function FamilyBarChart({ familles }) {
  if (!familles?.length) return null
  const sorted = [...familles].sort((a, b) => b.nombre - a.nombre)
  const max = sorted[0].nombre
  return (
    <div
      role="img"
      aria-label={`Nombre de langues par famille linguistique : ${sorted.map((f) => `${f.nom} ${f.nombre}`).join(', ')}`}
      className="flex flex-col gap-3 my-6"
    >
      {sorted.map((f, i) => (
        <div key={f.nom} className="flex items-center gap-3">
          <div className="font-ui text-sm flex-shrink-0" style={{ width: 168, color: 'var(--text-primary)' }}>
            {f.nom}
          </div>
          <div className="flex-1 rounded-full relative overflow-hidden" style={{ height: 14, background: 'var(--sable-dark)' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(f.nombre / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-full"
              style={{ height: '100%', background: 'var(--or)' }}
            />
          </div>
          <div className="font-ui text-sm font-semibold flex-shrink-0 text-right" style={{ width: 44, color: 'var(--text-primary)' }}>
            {f.nombre}
          </div>
        </div>
      ))}
    </div>
  )
}
