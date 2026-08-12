import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs'
import Sidebar from './Sidebar'
import TOC from './TOC'
import LessonNav from '../ui/LessonNav'
import { getGroupForPath } from '../../config/nav'

export default function DocsLayout({ title, description, children }) {
  const { pathname } = useLocation()
  const group = getGroupForPath(pathname)
  const contentRef = useRef(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="pt-20">
      <header className="page-header py-10 md:py-14">
        <div className="container-fx">
          <Breadcrumbs group={group} title={title} />
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--indigo)' }}>
                {title}
              </h1>
              {description && (
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="xl:hidden flex items-center gap-2 font-ui text-sm font-medium px-4 py-2 rounded-lg flex-shrink-0"
              style={{ background: 'var(--blanc)', border: '1px solid var(--border)', color: 'var(--indigo)' }}
            >
              <Menu size={16} /> Sommaire
            </button>
          </div>
        </div>
      </header>

      <div className="container-fx py-12">
        <div className="docs-grid">
          <aside className="hidden xl:block docs-sidebar">
            <Sidebar />
          </aside>

          <div ref={contentRef} className="min-w-0">
            {children}
            <LessonNav />
          </div>

          <aside className="hidden xl:block docs-toc">
            <TOC contentRef={contentRef} />
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] xl:hidden"
              style={{ background: 'rgba(31,33,41,0.4)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] xl:hidden overflow-y-auto"
              style={{ background: 'var(--blanc)' }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="font-ui font-semibold text-sm" style={{ color: 'var(--indigo)' }}>Sommaire</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Fermer le sommaire">
                  <X size={20} color="var(--indigo)" />
                </button>
              </div>
              <div className="p-4">
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
