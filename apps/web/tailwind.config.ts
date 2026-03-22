import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        text: "var(--text)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
