/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Palette primary — pilotée par CSS custom properties (thème couleur dynamique)
        primary: {
          100: 'rgb(var(--p100) / <alpha-value>)',
          200: 'rgb(var(--p200) / <alpha-value>)',
          300: 'rgb(var(--p300) / <alpha-value>)',
          400: 'rgb(var(--p400) / <alpha-value>)',
          500: 'rgb(var(--p500) / <alpha-value>)',
          600: 'rgb(var(--p600) / <alpha-value>)',
          700: 'rgb(var(--p700) / <alpha-value>)',
          800: 'rgb(var(--p800) / <alpha-value>)',
          900: 'rgb(var(--p900) / <alpha-value>)',
        },
        // Palette neutre — gris légèrement cassé bleu (très subtil)
        neutral: {
          50:  '#F9F9FC',
          100: '#F2F3F8',
          200: '#E6E7F0',
          300: '#CBCEDD',
          400: '#9799B0',
          500: '#6A6D85',
          600: '#4F5268',
          700: '#383B54',
          800: '#22253B',
          900: '#14162A',
        },
        surface: '#FFFFFF',
        'surface-raised': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
