import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#080C14",
          soft: "#111726",
          line: "#1E293B",
        },
        panel: "#1B2337",
        paper: {
          DEFAULT: "#F8FAFC",
          dim: "#94A3B8",
          faint: "#64748B",
        },
        mint: {
          DEFAULT: "#00E5A3",
          bright: "#2EEEB8",
        },
        indigo: "#5E5CE6",
        film: "#FF453A",
        show: "#BF5AF2",
        game: "#30D158",
        book: "#F2B705",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
