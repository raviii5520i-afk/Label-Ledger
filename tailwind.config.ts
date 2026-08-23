import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FB",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#0284C7",
          hover: "#0369A1",
          light: "#E0F2FE",
        },
        teal: {
          DEFAULT: "#0D9488",
          light: "#CCFBF1",
        },
        indigo: {
          DEFAULT: "#6366F1",
          light: "#EEF2FF",
        },
        text: {
          main: "#111318",
          muted: "#6B7280",
        },
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        control: "8px",
        card: "16px",
        panel: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        modal: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
