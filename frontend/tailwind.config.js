/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy:  '#1B3A5C',
          teal:  '#0E7A6E',
          amber: '#C47A1E',
        },
      },
    },
  },
  plugins: [],
};