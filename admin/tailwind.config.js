/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        basalt: {
          DEFAULT: '#1B1714',
          2: '#262019',
          3: '#332B22',
        },
        bone: {
          DEFAULT: '#EFE4D0',
          soft: '#F6F0E3',
        },
        crimson: {
          DEFAULT: '#8E2438',
          light: '#A8354B',
        },
        brass: {
          DEFAULT: '#B08D4F',
          light: '#C7A868',
        },
        forest: {
          DEFAULT: '#3C4A34',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Karla', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
