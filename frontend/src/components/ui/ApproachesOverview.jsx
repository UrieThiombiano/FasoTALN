import { Layers, RefreshCcw, Zap, Waves, Shuffle, Sparkles } from 'lucide-react'
import RevealOnScroll from './RevealOnScroll'

const ICONS = {
  'modeles-multilingues': Layers,
  'adaptation-africaine': RefreshCcw,
  'adaptateurs-legers': Zap,
  'traits-phonemiques': Waves,
  'augmentation-donnees': Shuffle,
  'few-shot-llm': Sparkles,
}

export default function ApproachesOverview({ items }) {
  return (
    <RevealOnScroll>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {items.map((item, i) => {
          const Icon = ICONS[item.id] || Layers
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="card-fx p-4 flex flex-col items-center text-center gap-2 no-underline transition-transform hover:-translate-y-1"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(109,91,208,0.12)' }}
              >
                <Icon size={18} color="var(--or-dark)" />
              </div>
              <span className="font-ui text-xs font-semibold leading-snug" style={{ color: 'var(--indigo)' }}>
                {item.nom}
              </span>
            </a>
          )
        })}
      </div>
    </RevealOnScroll>
  )
}
