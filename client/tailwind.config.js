// NMIMS brand palette only (Red #CC2626, Grey #5A5A5A, Dark Grey #2A2A2A). `colors` replaces Tailwind's
// defaults, so off-brand classes like bg-green-600 generate no CSS at all.
const red = {
  50: '#fdf4f4',
  100: '#fbe6e6',
  200: '#f5c9c9',
  300: '#eba3a3',
  400: '#dd6464',
  500: '#d43c3c',
  600: '#CC2626', // NMIMS Red
  700: '#a91f1f',
  800: '#8a1a1a',
  900: '#6f1616',
  950: '#3d0a0a',
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      primary: red,
      red,
      gray: {
        50: '#f7f7f7',
        100: '#efefef',
        200: '#e2e2e2',
        300: '#cfcfcf',
        400: '#a3a3a3',
        500: '#6e6e6e', // lightest grey that passes AA as text on white (5.1:1) and the gray-50 page (4.76:1)
        600: '#5A5A5A', // NMIMS Grey
        700: '#444444',
        800: '#2A2A2A', // NMIMS Dark Grey
        900: '#1f1f1f',
        950: '#141414',
      },
    },
  },
  plugins: [],
}
