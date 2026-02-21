import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Kategori utama
const categories = [
  { key: "Sekretariat", label: "Sekretariat" },
  { key: "Bidang Ketersediaan", label: "Ketersediaan" },
  { key: "Bidang Distribusi", label: "Distribusi" },
  { key: "Bidang Konsumsi", label: "Konsumsi" },
  { key: "UPTD", label: "UPTD" },
];

// Modul per kategori (contoh, tambahkan sesuai kebutuhan)
const modulesByCategory = {
  Sekretariat: [
    { id: "SA01", name: "Monitoring 50 indikator" },
    { id: "SA02", name: "Tool modul tanpa coding" },
    {
      id: "SA03",
      name: "Tata Naskah Dinas",
      approval: true,
    },
    { id: "SA04", name: "Database peraturan", publik: true },
    // ...tambahkan modul lain...
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

  // Handle click kategori
  const handleCategoryClick = (catKey) => {
    setActiveCategory(catKey === activeCategory ? null : catKey);
    setDropdownOpen(catKey !== activeCategory);
  };

  // Handle click modul
  const handleModuleClick = (modulId) => {
    setDropdownOpen(false);
    setActiveCategory(null);
    navigate(`/module/${modulId.toLowerCase()}`);
  };

  // Close dropdown when click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-muted bg-ink/80 backdrop-blur text-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-2xl font-display text-primary">
              Dashboard Super Admin
            </h2>
            <p className="text-sm text-muted">
              Executive Control Center — Semua Modul, KPI, dan Alert
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow">
              Generate Mendagri Report
            </button>
            <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow">
              Open AI Inbox
            </button>
          </div>
        </div>
      </header>
      {/* Sidebar horizontal kategori */}
      <nav className="w-full border-b border-muted bg-ink text-surface shadow-sm">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-4 px-8 py-2">
          {categories.map((cat) => (
            <div key={cat.key} className="relative">
              <button
                className={`px-4 py-2 rounded font-semibold flex items-center gap-2 transition ${
                  activeCategory === cat.key
                    ? "bg-accent text-surface"
                    : "bg-ink text-accent hover:bg-accentDark"
                }`}
                onClick={() => handleCategoryClick(cat.key)}
              >
                <span>{cat.badge}</span>
                <span>{cat.label}</span>
              </button>
              {/* Dropdown modul */}
              {activeCategory === cat.key && dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className={`absolute left-0 mt-2 rounded shadow-lg z-20 min-w-[260px] ${dark ? "bg-ink text-surface" : "bg-white text-ink"}`}
                >
                  {modulesByCategory[cat.key]?.map((modul) => (
                    <button
                      key={modul.id}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 rounded transition ${
                        dark
                          ? "hover:bg-accentDark hover:text-accent"
                          : "hover:bg-neutral-200 hover:text-primary"
                      }`}
                      onClick={() => handleModuleClick(modul.id)}
                    >
                      <span>{modul.badge}</span>
                      <span className="truncate">{modul.name}</span>
                      {modul.approval && (
                        <span
                          className={`ml-auto text-xs px-2 py-1 rounded ${dark ? "bg-yellow-700 text-yellow-100" : "bg-yellow-200 text-yellow-800"}`}
                        >
                          Approval
                        </span>
                      )}
                      {modul.publik && (
                        <span
                          className={`ml-auto text-xs px-2 py-1 rounded ${dark ? "bg-blue-700 text-blue-100" : "bg-blue-100 text-blue-700"}`}
                        >
                          Publik
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
      {/* Konten utama dashboard */}
      <main className="flex-1 px-8 py-8 mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
