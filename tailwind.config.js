/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          'bg-secondary': '#1e293b',
          text: '#f1f5f9',
          'text-secondary': '#cbd5e1',
          border: '#334155',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
