/**
 * BogolonDivider — séparateur de sections inspiré du bogolan burkinabè.
 * Motif géométrique SVG (losanges, croix et points aux couleurs du pays),
 * signature visuelle de FasoXplore. Utilisé entre chaque grande section.
 */
export default function BogolonDivider() {
  return (
    <div className="w-full overflow-hidden" style={{ height: 20 }}>
      <svg
        width="100%"
        height="20"
        viewBox="0 0 400 20"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="bog" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            {/* Fond or subtil */}
            <rect width="40" height="20" fill="#F0A500" opacity="0.12" />
            {/* Losange central argile */}
            <polygon points="20,2 38,10 20,18 2,10" fill="none" stroke="#B8411A" strokeWidth="1" opacity="0.35" />
            {/* Croix centrale */}
            <line x1="20" y1="0" x2="20" y2="20" stroke="#1A1230" strokeWidth="0.8" opacity="0.2" />
            <line x1="0" y1="10" x2="40" y2="10" stroke="#1A1230" strokeWidth="0.8" opacity="0.2" />
            {/* Points aux coins */}
            <circle cx="0" cy="0" r="1.5" fill="#1E6B4A" opacity="0.4" />
            <circle cx="40" cy="0" r="1.5" fill="#1E6B4A" opacity="0.4" />
            <circle cx="0" cy="20" r="1.5" fill="#1E6B4A" opacity="0.4" />
            <circle cx="40" cy="20" r="1.5" fill="#1E6B4A" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="20" fill="url(#bog)" />
      </svg>
    </div>
  )
}
