import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'off-white': '#FAF7F5',
        blush: '#E8B4C0',
        rose: '#C4768A',
        dusty: '#F5E6EA',
        gold: '#C9A882',
        charcoal: '#1A1A1A',
        dark: '#0D0D0D',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
