/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0c0e14',
          800: '#12151e',
          700: '#161a25',
          600: '#1a1f2e',
          500: '#1e2333',
          400: '#252a3a',
          300: '#2a3040',
        },
        accent: {
          blue: '#4f7cff',
          purple: '#7c5cfc',
          cyan: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
