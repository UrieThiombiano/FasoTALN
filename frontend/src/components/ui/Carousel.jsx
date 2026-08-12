import { Children, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({ children }) {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const items = Children.toArray(children)

  const scrollToIndex = (index) => {
    const track = trackRef.current
    const target = track?.children[index]
    if (!track || !target) return
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    let closest = 0
    let minDistance = Infinity
    Array.from(track.children).forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - track.scrollLeft)
      if (distance < minDistance) {
        minDistance = distance
        closest = index
      }
    })
    setActive(closest)
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((child, index) => (
          <div key={index} className="snap-start flex-shrink-0" style={{ width: 'min(320px, 85vw)' }}>
            {child}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => scrollToIndex(Math.max(active - 1, 0))}
          disabled={active === 0}
          aria-label="Élément précédent"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
          style={{ border: '1px solid var(--border)', background: 'var(--blanc)' }}
        >
          <ChevronLeft size={18} color="var(--or-dark)" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Aller à l'élément ${index + 1}`}
              aria-current={index === active}
              onClick={() => scrollToIndex(index)}
              className="rounded-full transition-all"
              style={{
                width: index === active ? 20 : 8,
                height: 8,
                background: index === active ? 'var(--or-dark)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(Math.min(active + 1, items.length - 1))}
          disabled={active === items.length - 1}
          aria-label="Élément suivant"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
          style={{ border: '1px solid var(--border)', background: 'var(--blanc)' }}
        >
          <ChevronRight size={18} color="var(--or-dark)" />
        </button>
      </div>
    </div>
  )
}
