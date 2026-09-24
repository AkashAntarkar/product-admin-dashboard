/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171a21",
        paper: "#f6f5f1",
        line: "#dedad0",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#5b5ff5",
          600: "#4640d6",
          700: "#3730a3",
          800: "#2e2a80",
          900: "#231f5c",
        },
        moss: "#4b6a52",
        rust: "#b5502c",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(23,26,33,0.06)",
      },
    },
  },
  plugins: [],
};
