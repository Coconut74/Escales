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
        // Palette primary — source Token.json Figma
        primary: {
          100: '#FFF8F1',
          200: '#FFECDC',
          300: '#FCCFA9',
          400: '#F9AC6D',
          500: '#EE9044',
          600: '#E17924',
          700: '#B95415',
          800: '#5F3012',
          900: '#2C1914',
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
