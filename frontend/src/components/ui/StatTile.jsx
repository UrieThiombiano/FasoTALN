export default function StatTile({ value, label }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'var(--sable)', border: '1px solid var(--border)' }}>
      <div className="font-display text-2xl font-bold" style={{ color: 'var(--or-dark)' }}>{value}</div>
      <div className="font-ui text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
