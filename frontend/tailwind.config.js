/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
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
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#0ea5e9",
        // Design token — Primary: #0B5FFF (bukan Tailwind blue-600 #2563EB)
        primary: "#0B5FFF",
        success: "#06A657",
        bg: "#F6F7FB",
        card: "#FFFFFF",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        // Sidebar design token: 280px expanded, 72px collapsed
        sidebar: "280px",
        "sidebar-sm": "72px",
      },
      width: {
        sidebar: "280px",
        "sidebar-sm": "72px",
      },
      fontFamily: {
        // Inter sebagai font utama dashboard (design token)
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Dokumen spec: H1 = 28px/700
        h1: ["1.75rem", { fontWeight: "700", lineHeight: "1.3" }],
        // H2 = 22px/600
        h2: ["1.375rem", { fontWeight: "600", lineHeight: "1.4" }],
        // H3 = 18px/600
        h3: ["1.125rem", { fontWeight: "600", lineHeight: "1.4" }],
      },
      boxShadow: {
        soft: "0 18px 36px -24px rgba(15, 23, 42, 0.45)",
        "soft-sm": "0 10px 20px -18px rgba(15, 23, 42, 0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      gridTemplateColumns: {
        // 12-kolom desktop standar (dokumen spec)
        12: "repeat(12, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
