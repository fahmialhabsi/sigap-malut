// frontend/src/components/BukaEPelaraButton.jsx
// Q1 — SSO: Tombol untuk membuka e-Pelara langsung dari SIGAP.
// Alur: SIGAP backend issue SSO token (signed with SSO_SHARED_SECRET),
// lalu token itu dikirim via URL ?token= ke e-Pelara.
// e-Pelara memverifikasi dengan SSO_SHARED_SECRET yang sama.
// Ini menghindari ketergantungan sinkronisasi JWT_SECRET antar sistem.

import React, { useState } from "react";

const EPELARA_BASE_URL =
  import.meta.env.VITE_EPELARA_URL || "http://localhost:3001";

/**
 * BukaEPelaraButton
 *
 * Props:
 * - label      {string}  Teks tombol (default: "Buka e-Pelara")
 * - targetPath {string}  Path tujuan di e-Pelara, misal "/rpjmd/dashboard" (default: "/")
 * - className  {string}  Tambahan Tailwind class
 */
export default function BukaEPelaraButton({
  label = "Buka e-Pelara",
  targetPath = "/",
  className = "",
}) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    const sigapToken = localStorage.getItem("token");

    if (!sigapToken) {
      alert("Anda belum login. Silakan login terlebih dahulu.");
      return;
    }

    setIsOpening(true);
    setError(null);

    try {
      // Minta SIGAP backend untuk generate SSO token khusus e-Pelara
      // Token ini ditandatangani dengan SSO_SHARED_SECRET (bukan JWT_SECRET SIGAP)
      const resp = await fetch("/api/auth/sso-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sigapToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(
          body.message || `Gagal mendapatkan SSO token (${resp.status})`,
        );
      }

      const { token: ssoToken } = await resp.json();

      // Buka e-Pelara dengan SSO token — AuthProvider.jsx e-Pelara membaca
      // token ini, menyimpannya ke localStorage, lalu membersihkan URL.
      const targetUrl = `${EPELARA_BASE_URL}${targetPath}?token=${encodeURIComponent(ssoToken)}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("[BukaEPelaraButton] SSO error:", err);
      setError(err.message);
    } finally {
      setTimeout(() => setIsOpening(false), 1000);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isOpening}
        title="Buka aplikasi e-Pelara dengan login otomatis (SSO)"
        className={[
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
          "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
          "text-white transition-colors duration-150",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Ikon eksternal */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>

        {isOpening ? "Membuka…" : label}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
