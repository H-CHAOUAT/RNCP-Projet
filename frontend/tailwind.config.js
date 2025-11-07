/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#2B2523",       // Slightly softer dark brown
        wine: "#8C3B3B",       // Warmer, richer red accent
        sand: "#C2B3A3",       // Warm beige background
        cream: "#F3EEE9",      // Light neutral background
        accent: "#EAD8C0",     // Subtle highlight tone
      },
    },
  },
  plugins: [],
}
