export default function IPADisplay({ ipa, label = 'Transcription IPA', delimiters = true }) {
  return (
    <div>
      <div
        className="font-ui text-xs font-semibold tracking-widest uppercase mb-2"
        style={{ color: 'var(--or)' }}
      >
        {label}
      </div>
      <div
        className="font-mono text-lg sm:text-xl rounded-2xl px-5 py-4 break-words"
        style={{ background: 'var(--sable)', color: 'var(--indigo)', border: '1px solid var(--border)' }}
      >
        {ipa ? (delimiters ? `/${ipa}/` : ipa) : <span style={{ color: 'var(--text-muted)' }}>…</span>}
      </div>
    </div>
  )
}
