/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#b8ccff',
          300: '#8aabff',
          400: '#5c86ff',
          500: '#2563eb',
          600: '#1a4fd1',
          700: '#1340b0',
          800: '#0e308a',
          900: '#092268',
        },
        surface: '#f8fafc',
        'surface-raised': '#ffffff',
      },
    },
  },
  plugins: [],
}
