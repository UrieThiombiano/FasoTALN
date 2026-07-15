import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

/**
 * RevealOnScroll — enveloppe un enfant et l'anime en fondu+montée
 * dès qu'il entre dans le viewport.
 * Props :
 *   delay   : délai en secondes (défaut 0)
 *   y       : translation verticale de départ (défaut 32)
 *   once    : si true (défaut), animation une seule fois
 */
export default function RevealOnScroll({ children, delay = 0, y = 32, once = true, className = '' }) {
  const ref      = useRef(null)
  const inView   = useInView(ref, { once, margin: '-60px' })
  const controls = useAnimation()

  useEffect(() => {
    if (inView) controls.start('visible')
    else if (!once) controls.start('hidden')
  }, [inView, controls, once])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } }
      }}
    >
      {children}
    </motion.div>
  )
}
