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
        // Palette neutre froide — bleu-gris (blue-slate cassé)
        neutral: {
          50:  '#F7F8FC',
          100: '#EEF0F8',
          200: '#DDE1F0',
          300: '#BFC6DE',
          400: '#8D97B8',
          500: '#5F6B8C',
          600: '#444F6F',
          700: '#303A56',
          800: '#1E2438',
          900: '#11162A',
        },
        surface: '#F5F6FC',
        'surface-raised': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
