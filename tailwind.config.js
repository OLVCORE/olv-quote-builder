/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ourovelho: {
          DEFAULT: '#bfa14a', // Ouro velho principal
          dark: '#8c7a2a',   // Ouro velho escuro
        },
        olvblue: {
          DEFAULT: '#1a2338', // Azul OLV sidebar
          light: '#22304a',
        },
      },
    },
  },
  plugins: [],
}; 