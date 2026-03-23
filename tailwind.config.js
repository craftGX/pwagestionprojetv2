/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // supprime cette ligne si tu n'as pas /src/pages
  ],
  theme: {
    extend: {
      // tes couleurs, radius, etc.
    },
  },
  plugins: [],
};

module.exports = config;
