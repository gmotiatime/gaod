/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Times New Roman"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography,
  ],
}
