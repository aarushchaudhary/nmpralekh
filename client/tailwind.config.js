/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fcf3f3',
          100: '#f8e3e3',
          200: '#f1caca',
          300: '#e5a5a5',
          400: '#d57171',
          500: '#c53b3b',
          600: '#aa2424', // Sophisticated deeper red
          700: '#8a1a1a', 
          800: '#731717',
          900: '#611616',
          950: '#350808',
        },
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      }
    },
  },
  plugins: [],
}
