/** Shared Tailwind preset for Eufraat web + app */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens (driven by CSS variables in globals.css).
        // 'ink' = page background, 'cream' = page text, 'card' = surface.
        // These automatically swap when html.light vs html.dark is set.
        ink: "rgb(var(--ink) / <alpha-value>)",
        cream: "rgb(var(--cream) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        "gold-soft": "rgb(var(--gold-soft) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        // 'line' = subtle borders/surfaces, value flips per theme
        line: "rgb(var(--line) / <alpha-value>)",
        eufraat: {
          // Warme mediterrane palette gebaseerd op huidige eufraat.nl signatuur
          50: "#fdf8f3",
          100: "#f9ecd9",
          200: "#f1d3a5",
          300: "#e6b370",
          400: "#d99347",
          500: "#c87a2b", // primary — gebrand oranje/oker
          600: "#a8601f",
          700: "#854a1c",
          800: "#5e351a",
          900: "#3a2110",
        },
        zaitun: {
          // Olijfgroen accent
          50: "#f3f6ee",
          100: "#e2ead0",
          200: "#c4d4a4",
          300: "#9fb771",
          400: "#7d9b4b",
          500: "#5f7d36",
          600: "#476129",
          700: "#374b22",
          800: "#293720",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
