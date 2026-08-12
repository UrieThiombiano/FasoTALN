import { useEffect, useState } from 'react'

export default function TOC({ contentRef }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    let intersectionObserver = null

    function scan() {
      const nodes = Array.from(root.querySelectorAll('[data-toc]'))

      if (intersectionObserver) {
        intersectionObserver.disconnect()
        intersectionObserver = null
      }

      if (nodes.length === 0) {
        setHeadings([])
        return
      }

      nodes.forEach((node, i) => {
        if (!node.id) node.id = `toc-${i}-${node.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`
      })
      setHeadings(nodes.map((n) => ({ id: n.id, text: n.textContent, level: n.tagName })))

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting)
          if (visible.length > 0) setActiveId(visible[0].target.id)
        },
        { rootMargin: '-96px 0px -70% 0px' }
      )
      nodes.forEach((n) => intersectionObserver.observe(n))
    }

    scan()

    const mutationObserver = new MutationObserver(scan)
    mutationObserver.observe(root, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      if (intersectionObserver) intersectionObserver.disconnect()
    }
  }, [contentRef])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Sur cette page" className="flex flex-col gap-1">
      <div
        className="font-ui text-xs font-semibold tracking-widest uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Sur cette page
      </div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className="text-sm py-1 transition-colors"
          style={{
            color: activeId === h.id ? 'var(--or)' : 'var(--text-muted)',
            fontWeight: activeId === h.id ? 600 : 400,
            paddingLeft: h.level === 'H3' ? '0.75rem' : 0,
          }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
