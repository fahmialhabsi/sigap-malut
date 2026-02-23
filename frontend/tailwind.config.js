/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        canvas: "#f5f2ed",
        surface: "#ffffff",
        muted: "#64748b",
        accent: "#0f766e",
        accentDark: "#0b4f4a",
        accentSoft: "#e7f5f2",
        warning: "#F59E0B", // from design-tokens.json
        danger: "#EF4444", // from design-tokens.json
        info: "#0ea5e9",
        primary: "#0B5FFF", // from design-tokens.json
        success: "#06A657", // from design-tokens.json
        bg: "#F6F7FB", // from design-tokens.json
        card: "#FFFFFF", // from design-tokens.json
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui"], // from design-tokens.json
        sans: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        soft: "0 18px 36px -24px rgba(15, 23, 42, 0.45)",
        "soft-sm": "0 10px 20px -18px rgba(15, 23, 42, 0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
