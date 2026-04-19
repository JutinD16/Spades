import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        felt: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          shadow: '#0D2318',
          dark: '#112B20',
        },
        gold: {
          DEFAULT: '#C8973A',
          bright: '#E8B84B',
          dim: '#8A6520',
        },
        card: {
          face: '#FFFEF0',
          border: '#D4C5A0',
        },
        suit: {
          red: '#C41E3A',
          black: '#1A1A1A',
        },
        team: {
          ns: '#4A90D9',
          we: '#D94A4A',
        },
        bg: {
          dark: '#0D1F14',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)',
        'card-selected': '0 0 0 2px #C8973A, 0 8px 24px rgba(200,151,58,0.4)',
        glow: '0 0 20px rgba(200,151,58,0.4)',
        'glow-ns': '0 0 20px rgba(74,144,217,0.5)',
        'glow-we': '0 0 20px rgba(217,74,74,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
