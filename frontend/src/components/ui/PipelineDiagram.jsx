import { FileText, Cpu, Waves, Braces, Network, Tags } from 'lucide-react'
import RevealOnScroll from './RevealOnScroll'

const steps = [
  { icon: FileText, title: 'Texte', desc: 'Texte brut en langue nationale', color: 'var(--mil)' },
  { icon: Cpu,       title: 'ByT5 fine-tuné', desc: 'Modèle G2P byte-level', color: 'var(--argile)' },
  { icon: Waves,     title: 'IPA', desc: 'Transcription phonémique', color: 'var(--mil)' },
  { icon: Braces,    title: 'Construction de l’entrée', desc: '[CLS] texte [SEP] IPA [SEP]', color: 'var(--argile)', mono: true },
  { icon: Network,   title: 'AfroXLMR', desc: 'Encodeur multilingue africain', color: 'var(--mil)' },
  { icon: Tags,      title: 'Classification', desc: 'Classe prédite + probabilités', color: 'var(--argile)' },
]

function StepCard({ step, index }) {
  const Icon = step.icon
  return (
    <div className="card-fx p-5 relative h-full" style={{ textAlign: 'center' }}>
      <div
        className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center font-ui text-xs font-bold flex-shrink-0"
        style={{ background: 'var(--sable)', color: 'var(--text-muted)' }}
      >
        {index + 1}
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: `${step.color}18` }}
      >
        <Icon size={20} color={step.color} strokeWidth={1.8} />
      </div>
      <div className="font-display text-base font-bold mb-1" style={{ color: 'var(--indigo)' }}>
        {step.title}
      </div>
      <div
        className={`${step.mono ? 'font-mono' : 'font-body'} text-xs break-words`}
        style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}
      >
        {step.desc}
      </div>
    </div>
  )
}

export default function PipelineDiagram() {
  return (
    <RevealOnScroll>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <StepCard key={step.title} step={step} index={i} />
        ))}
      </div>
    </RevealOnScroll>
  )
}
