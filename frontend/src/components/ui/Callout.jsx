import { BookOpen, Lightbulb, AlertTriangle, Pin } from 'lucide-react'

const VARIANTS = {
  definition: { icon: BookOpen, label: 'Définition', color: 'var(--or-dark)' },
  example:    { icon: Lightbulb, label: 'Exemple', color: 'var(--mil)' },
  attention:  { icon: AlertTriangle, label: 'Attention', color: 'var(--argile)' },
  note:       { icon: Pin, label: 'À retenir', color: 'var(--indigo)' },
}

export default function Callout({ variant = 'note', title, children }) {
  const { icon: Icon, label, color } = VARIANTS[variant] || VARIANTS.note
  return (
    <div className={`callout callout-${variant}`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" color={color} />
      <div>
        <div className="font-ui text-xs font-semibold tracking-wide uppercase mb-1" style={{ color }}>
          {title || label}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
