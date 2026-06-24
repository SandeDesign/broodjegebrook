import type { Config } from "tailwindcss";
import preset from "@eufraat/ui/tailwind-preset";

export default {
  presets: [preset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // NOTE: ink/cream/gold/card are intentionally NOT redefined here.
      // They live in the shared preset as CSS variables so they auto-swap
      // between dark and light themes. Overriding them with hex values
      // would break theming.
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
} satisfies Config;
