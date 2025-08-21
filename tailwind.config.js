/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // твои файлы
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9C45FF",
          dark: "#7C3AED",
          light: "#E9D5FF",
        },
        secondary: "#FF7E33",
        accent: "#00C4B3",
      },
    },
  },
  plugins: [],
};
