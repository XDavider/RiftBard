/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        app: 'rgb(var(--bg-app) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        subtle: 'rgb(var(--bg-subtle) / <alpha-value>)',
        line: 'rgb(var(--border-subtle) / <alpha-value>)',
        'line-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        'ink-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        ivory: {
          50: '#FFFFFF',
          100: '#F7F6F2',
          200: '#EFECE6',
          300: '#E4E2DC',
          400: '#D0CEC6',
        },
        ink: {
          900: '#161615',
          700: '#3B3A36',
          500: '#5E5C56',
          400: '#8A877F',
        },
        dark: {
          950: '#070a10',
          900: '#0d131f',
          850: '#121a2a',
          800: '#182236',
          750: '#1e2a42',
          700: '#253450',
          600: '#334568',
          500: '#475e88',
        },
        primary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
        },
        accent: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
          gold: '#fbbf24',
          meep: '#fef08a',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(245, 158, 11, 0.45)',
        'glow-meep': '0 0 35px rgba(251, 191, 36, 0.6)',
        'glow-card': '0 12px 30px -10px rgba(245, 158, 11, 0.25)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
