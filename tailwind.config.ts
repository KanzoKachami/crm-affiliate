import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10121A",
        panel: "#181B24",
        "panel-raised": "#1F2330",
        line: "#262B38",
        fog: "#8A90A3",
        paper: "#EAEDF4",
        signal: {
          DEFAULT: "#43E2C0",
          dim: "#2B7A6C",
        },
        ember: {
          DEFAULT: "#FFA84C",
          dim: "#6B4A22",
        },
        risk: {
          DEFAULT: "#E85C58",
          dim: "#5A2B2B",
        },
        drift: {
          DEFAULT: "#7C9CFF",
          dim: "#2E3A66",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
