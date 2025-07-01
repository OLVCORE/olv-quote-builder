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
        // Paleta OLV Internacional
        bg: {
          light: '#ffffff',
          dark: '#0a0f1d',
          lightSecondary: '#f5f7fa',
          lightTertiary: '#e9eef5',
          darkSecondary: '#12161f',
          darkTertiary: 'rgba(255,255,255,0.05)',
        },
        txt: {
          light: '#003366',
          dark: '#e6f2ff',
        },
        accent: {
          light: '#0080cc',
          lightHover: '#006fa1',
          dark: '#d4af37',
          darkHover: '#b9952e',
        },
        shadow: {
          light: 'rgba(0,0,0,0.1)',
          dark: 'rgba(0,0,0,0.5)',
        },
        sidebar: {
          dark: '#0e1425',
          text: '#e1e9f0',
          hover: '#b9952e',
          active: '#d4af37',
        },
      },
    },
  },
  plugins: [],
}; 