/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#0a0514',
          900: '#120a22',
          800: '#1b0f32',
          700: '#29174b',
          600: '#392164',
          500: '#4c2e82',
        },
        primary: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      }
    },
  },
  plugins: [],
}
