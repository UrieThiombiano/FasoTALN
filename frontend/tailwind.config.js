/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette FasoTALN — violet de marque sur fond clair, accents sémantiques
        indigo:   { DEFAULT: '#1F2129', light: '#3A3C4A', faint: '#9CA3AF' },
        or:       { DEFAULT: '#6D5BD0', light: '#8B7ADC', dark: '#4F46E5' },
        argile:   { DEFAULT: '#EA580C', light: '#FB923C', dark: '#C2410C' },
        mil:      { DEFAULT: '#16A34A', light: '#22C55E', dark: '#15803D' },
        sable:    { DEFAULT: '#F7F7FB', dark: '#ECECF2' },
        blanc:    { DEFAULT: '#FFFFFF' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        ui:      ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease-out forwards',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
