/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7EE',
        charcoal: '#1C1A16',
        hero: '#FFD338',
        pastel: '#FDF0C6',
        amber: '#E8A93D',
        butter: '#FAF3DC',
        success: '#DDECC8',
        'gray-warm': {
          500: '#8A8578',
          800: '#4A463D'
        }
      },
      borderRadius: {
        card: '24px',
        pill: '9999px'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif']
      }
    }
  },
  corePlugins: {
    // El reset global de Tailwind (preflight) pisaria los estilos existentes
    // de styles.css en el resto de la app. Lo desactivamos por ahora; las
    // utilidades de Tailwind funcionan igual sin el.
    preflight: false
  },
  plugins: []
};
