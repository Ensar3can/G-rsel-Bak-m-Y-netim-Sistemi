/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B16',
          900: '#0B1220',
          800: '#12203A',
          700: '#1A2F54',
          600: '#25406E',
          500: '#3B5A8A',
          400: '#6B86B0',
          200: '#C5D2E8',
          100: '#E8EEF7',
        },
        brand: {
          yellow: '#F5C518',
          gold: '#D4A017',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(7, 11, 22, 0.18)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
