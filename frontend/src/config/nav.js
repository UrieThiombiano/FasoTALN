/**
 * Source de vérité unique pour la navigation de contenu : Navbar (dropdown),
 * Sidebar (arbre complet), Breadcrumbs et LessonNav (précédent/suivant)
 * en dérivent tous. L'ordre des groupes/pages reflète le parcours
 * curriculaire du site.
 */
export const NAV = [
  {
    group: 'Langues',
    items: [
      { to: '/langues', label: 'Les langues africaines' },
    ],
  },
  {
    group: 'TALN africain',
    items: [
      { to: '/glossaire', label: 'Glossaire' },
      { to: '/defis', label: 'Les défis du TALN' },
      { to: '/approches', label: 'Approches actuelles' },
      { to: '/ressources', label: 'Ressources' },
    ],
  },
  {
    group: 'Approche phonémique',
    items: [
      { to: '/contribution', label: 'Notre contribution' },
      { to: '/demo-g2p', label: 'Transcription en IPA (G2P)' },
      { to: '/pipeline', label: 'Pipeline de classification (texte + IPA)' },
      { to: '/resultats', label: 'Résultats' },
      { to: '/perspectives', label: 'Perspectives de recherche' },
    ],
  },
  {
    group: 'Écosystème TALN-BF',
    items: [
      { to: '/ecosysteme', label: 'Écosystème TALN au Burkina Faso' },
    ],
  },
  {
    group: 'Actualités',
    items: [
      { to: '/nouvelles', label: 'Nouvelles du jour' },
    ],
  },
]

/** Liste plate ordonnée { to, label, group } pour la navigation séquentielle. */
export const FLAT_PAGES = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })))

export function getGroupForPath(pathname) {
  return NAV.find((g) => g.items.some((i) => i.to === pathname))?.group || null
}

export function getAdjacent(pathname) {
  const index = FLAT_PAGES.findIndex((p) => p.to === pathname)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index > 0 ? FLAT_PAGES[index - 1] : null,
    next: index < FLAT_PAGES.length - 1 ? FLAT_PAGES[index + 1] : null,
  }
}
