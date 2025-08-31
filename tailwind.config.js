/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // твои файлы
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9C45FF",
      },
    },
  },
  plugins: [],
};
