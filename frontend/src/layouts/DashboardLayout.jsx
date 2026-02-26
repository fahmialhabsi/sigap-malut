import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

// Kategori utama dan role mapping
const categories = [
  {
    key: "Sekretariat",
    label: "Sekretariat",
    roles: ["super_admin", "sekretaris"],
  },
  {
    key: "Bidang Ketersediaan",
    label: "Ketersediaan",
    roles: ["super_admin", "kepala_bidang_ketersediaan"],
  },
  {
    key: "Bidang Distribusi",
    label: "Distribusi",
    roles: ["super_admin", "kepala_bidang_distribusi"],
  },
  {
    key: "Bidang Konsumsi",
    label: "Konsumsi",
    roles: ["super_admin", "kepala_bidang_konsumsi"],
  },
  { key: "UPTD", label: "UPTD", roles: ["super_admin", "kepala_uptd"] },
];

// Modul per kategori (contoh, tambahkan sesuai kebutuhan)
const modulesByCategory = {
  Sekretariat: [
    { id: "SEK-ADM", name: "Administrasi Umum & Persuratan" },
    { id: "SEK-KEP", name: "Kepegawaian" },
    { id: "SEK-KEU", name: "Keuangan & Anggaran" },
    { id: "SEK-AST", name: "Aset & BMD" },
    { id: "SEK-RMH", name: "Rumah Tangga & Umum" },
    { id: "SEK-HUM", name: "Protokol & Kehumasan" },
    { id: "SEK-REN", name: "Perencanaan & Evaluasi" },
    { id: "SEK-KBJ", name: "Kebijakan & Koordinasi" },
    { id: "SEK-LKT", name: "Laporan Ketersediaan Pangan" },
    { id: "SEK-LDS", name: "Laporan Distribusi Pangan" },
    { id: "SEK-LKS", name: "Laporan Konsumsi & Keamanan Pangan" },
    { id: "SEK-LUP", name: "Laporan UPTD" },
  ],
  "Bidang Ketersediaan": [
    { id: "K001", name: "Master data komoditas", publik: true },
    { id: "K002", name: "Produksi pangan", publik: true },
    // ...tambahkan modul lain...
  ],
  "Bidang Distribusi": [
    { id: "D001", name: "Data pasar", publik: true },
    { id: "D002", name: "Harga pangan", publik: true },
    // ...tambahkan modul lain...
  ],
  "Bidang Konsumsi": [
    { id: "C001", name: "Konsumsi pangan", publik: true },
    { id: "C002", name: "Skor PPH", publik: true },
    // ...tambahkan modul lain...
  ],
  UPTD: [
    { id: "U001", name: "Sertifikasi Prima", approval: true },
    { id: "U002", name: "Audit pangan", approval: true },
    // ...tambahkan modul lain...
  ],
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dark] = useState(() => localStorage.getItem("darkMode") === "true");
  const dropdownRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  // Handle click modul
  const handleModuleClick = (modulId) => {
    navigate(`/module/${modulId.toLowerCase()}`);
  };

  // Cek apakah children adalah layout bidang (khusus distribusi)
  const isDistribusiLayout =
    children &&
    children.type &&
    (children.type.name === "DashboardDistribusiLayout" ||
      children.type.displayName === "DashboardDistribusiLayout");

  if (isDistribusiLayout) {
    // Untuk distribusi, render children saja tanpa header/nav/main
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Header hanya jika bukan distribusi */}
      {/* Hapus header dan ringkasan dashboard jika bukan distribusi */}
      {/* Navbar horizontal modul Sekretariat */}
      {user && user.role === "sekretaris" ? (
        <nav className="w-full border-b border-muted bg-ink text-surface shadow-sm">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-4 px-8 py-2">
            {modulesByCategory["Sekretariat"].map((modul) => (
              <button
                key={modul.id}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2 transition bg-ink text-accent hover:bg-accentDark"
                onClick={() => handleModuleClick(modul.id)}
              >
                <span>{modul.name}</span>
              </button>
            ))}
          </div>
        </nav>
      ) : (
        <nav className="w-full border-b border-muted bg-ink text-surface shadow-sm">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-4 px-8 py-2">
            {categories
              .filter((cat) => user && cat.roles.includes(user.role))
              .map((cat) => (
                <button
                  key={cat.key}
                  className="px-4 py-2 rounded font-semibold flex items-center gap-2 transition bg-ink text-accent hover:bg-accentDark"
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
          </div>
        </nav>
      )}
      {/* Konten utama dashboard */}
      <main className="flex-1 px-8 py-8 mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
