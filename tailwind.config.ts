import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dce8ff",
          200: "#b9d0ff",
          300: "#7faff5",
          400: "#4d89f0",
          500: "#2563eb",
          600: "#1d4fd8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3360",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
