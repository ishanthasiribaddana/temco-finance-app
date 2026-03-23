/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8e9fb',
          100: '#c5c8f5',
          200: '#9ea3ee',
          300: '#777ee7',
          400: '#5a62e1',
          500: '#0C1AD0',  // Temco Blue
          600: '#0a17bb',
          700: '#0813a3',
          800: '#060f8b',
          900: '#040a63',
        },
        temco: {
          yellow: '#FFDE03',
          blue: '#0336FF',
          pink: '#FF0266',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
