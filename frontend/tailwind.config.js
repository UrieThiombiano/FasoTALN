/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette FasoXplore — inspirée des matériaux du Burkina Faso
        indigo:   { DEFAULT: '#1A1230', light: '#2D1F4A', faint: '#3D2E5C' },
        or:       { DEFAULT: '#F0A500', light: '#F5C040', dark: '#C8820A' },
        argile:   { DEFAULT: '#B8411A', light: '#D05028', dark: '#8C2E10' },
        mil:      { DEFAULT: '#1E6B4A', light: '#2A8B62', dark: '#154D36' },
        sable:    { DEFAULT: '#FAF3E0', dark: '#F0E4C4' },
        blanc:    { DEFAULT: '#FEFCF7' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        ui:      ['"Space Grotesk"', 'system-ui', 'sans-serif'],
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
