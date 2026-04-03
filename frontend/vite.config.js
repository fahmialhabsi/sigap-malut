import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/master-data": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket Socket.IO
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [react()],
  define: {
    // Polyfill process.env untuk library yang masih pakai Node.js idiom
    "process.env": {},
  },
  build: {
    // Target modern browsers untuk bundle lebih kecil
    target: "es2020",
    // Chunk splitting untuk dashboard load < 1.5 detik pada 4G
    rollupOptions: {
      output: {
        manualChunks: {
          // react/react-dom tidak dipecah manual — memaksa split sering menghasilkan chunk kosong (rollup)
          "vendor-router": ["react-router-dom"],
          "vendor-charts": ["recharts", "chart.js", "react-chartjs-2"],
          "vendor-ui": ["react-hot-toast", "react-icons"],
          "vendor-socket": ["socket.io-client"],
          "vendor-export": ["pptxgenjs", "jspdf", "xlsx"],
          "vendor-map": ["leaflet", "react-leaflet"],
        },
      },
    },
    // Bundle utama + vendor-export masih >600kB; naikkan agar build tidak memunculkan warning noise
    chunkSizeWarningLimit: 1600,
    // Source map untuk production debugging (bisa dinonaktifkan jika ingin lebih cepat build)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Minifikasi dengan esbuild (lebih cepat dari terser)
    minify: "esbuild",
  },
  // Preload hint untuk modul kritis
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "zustand",
      "recharts",
      "leaflet",
      "react-leaflet",
    ],
    // Exclude besar yang hanya dipakai kadang-kadang
    exclude: ["pptxgenjs"],
  },
});
