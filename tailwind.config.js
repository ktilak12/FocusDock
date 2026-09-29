/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#090d16',
          card: '#111827',
          hover: '#1f2937',
          border: '#1e293b',
          muted: '#64748b',
          accent: '#38bdf8',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      boxShadow: {
        'glass': '0 20px 50px rgba(0, 0, 0, 0.4)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
