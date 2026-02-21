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
        warning: "#d97706",
        danger: "#b91c1c",
        info: "#0ea5e9",
      },
      fontFamily: {
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
