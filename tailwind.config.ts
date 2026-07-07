import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        roxo: {
          DEFAULT: '#6B21A8',
          light: '#7C3AED',
          dark: '#4C1D95',
        },
        branco: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
