import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        moci: {
          50: "#eef7f4",
          100: "#d3ebe1",
          200: "#a7d7c3",
          300: "#7bc3a5",
          400: "#4fae87",
          500: "#2f8f69",
          600: "#237253",
          700: "#1b5940",
          800: "#123b2b",
          900: "#0a2118",
        },
        accent: {
          500: "#e0a13a",
          600: "#c1841f",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
