import React, { useMemo, useState } from "react";
import { Children, isValidElement } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import * as HeroIcons from "@heroicons/react/outline";
import useAuthStore from "../stores/authStore";

// ...existing code...

// Mapping role ke kategori modul yang boleh diakses
const roleModuleAccess = {
  super_admin: [
    "Sekretariat",
    "Bidang Ketersediaan",
    "Bidang Distribusi",
    "Bidang Konsumsi",
    "UPTD",
  ],
  sekretaris: ["Sekretariat"],
  kepala_bidang: [
    "Bidang Ketersediaan",
    "Bidang Distribusi",
    "Bidang Konsumsi",
  ],
  kepala_uptd: ["UPTD"],
  kasubbag_umum: ["Sekretariat"],
  kasubbag_kepegawaian: ["Sekretariat"],
  fungsional_perencana: ["Sekretariat"],
  bendahara: ["Sekretariat:Keuangan"],
  fungsional_keuangan: ["Sekretariat:Keuangan"],
  pelaksana_keuangan: ["Sekretariat:Keuangan"],
  // Tambahkan role lain sesuai kebutuhan
};

const defaultModules = [
  {
    category: "Sekretariat",
    items: [
      { id: "M001", name: "Data ASN", icon: "👥" },
      { id: "M011", name: "Administrasi Umum", icon: "📄" },
      { id: "M016", name: "Aset & BMD", icon: "🏢" },
      { id: "M020", name: "Keuangan", icon: "💰" },
      { id: "M027", name: "Perencanaan", icon: "📊" },
      { id: "M081", name: "Laporan Masyarakat", icon: "💬" },
      { id: "CHATBOT", name: "AI Chatbot Routing Dokumen", icon: "🤖" },
    ],
  },
  {
    category: "Bidang Ketersediaan",
    items: [
      { id: "M032", name: "Data Komoditas", icon: "📦" },
      { id: "M033", name: "Produksi Pangan", icon: "🌾" },
      { id: "M036", name: "Peta Kerawanan", icon: "📍" },
      { id: "M038", name: "Early Warning", icon: "🚨" },
    ],
  },
  {
    category: "Bidang Distribusi",
    items: [
      { id: "M042", name: "Data Pasar", icon: "🏪" },
      { id: "M043", name: "Harga Pangan", icon: "💵" },
      { id: "M047", name: "Distribusi Pangan", icon: "🚚" },
      { id: "M048", name: "Cadangan Pangan", icon: "📦" },
      { id: "M051", name: "Operasi Pasar", icon: "🛒" },
    ],
  },
  {
    category: "Bidang Konsumsi",
    items: [
      { id: "M057", name: "Pola Konsumsi", icon: "🍽️" },
      { id: "M058", name: "B2SA", icon: "🥗" },
      { id: "M059", name: "Keamanan Pangan", icon: "🛡️" },
      { id: "M060", name: "Data Stunting", icon: "📈" },
    ],
  },
  {
    category: "UPTD",
    items: [
      { id: "M069", name: "Data Stok", icon: "📦" },
      { id: "M070", name: "Mutasi Gudang", icon: "🔄" },
      { id: "M071", name: "Distribusi Bantuan", icon: "🤝" },
    ],
  },
];

const missingModuleIdsByCategory = {
  Sekretariat: [
    "M002",
    "M003",
    "M004",
    "M005",
    "M006",
    "M007",
    "M008",
    "M009",
    "M010",
    "M012",
    "M013",
    "M014",
    "M015",
    "M017",
    "M018",
    "M019",
    "M021",
    "M022",
    "M023",
    "M024",
    "M025",
    "M026",
    "M028",
    "M029",
    "M030",
    "M031",
    "M082",
    "M083",
    "M084",
    "SA01",
    "SA02",
    "SA03",
    "SA04",
    "SA05",
    "SA06",
    "SA07",
    "SA08",
    "SA09",
    "SA10",
  ],
  "Bidang Ketersediaan": ["M034", "M035", "M037", "M039", "M040", "M041"],
  "Bidang Distribusi": [
    "M044",
    "M045",
    "M046",
    "M049",
    "M050",
    "M052",
    "M053",
    "M054",
    "M055",
  ],
  "Bidang Konsumsi": [
    "M056",
    "M061",
    "M062",
    "M063",
    "M064",
    "M065",
    "M066",
    "M067",
  ],
  UPTD: [
    "M068",
    "M072",
    "M073",
    "M074",
    "M075",
    "M076",
    "M077",
    "M078",
    "M079",
    "M080",
  ],
};

const moduleNameById = {
  M001: "Data ASN",
  M002: "Tracking KGB",
  M003: "Tracking Kenaikan Pangkat",
  M004: "Tracking Penghargaan",
  M005: "Data Cuti",
  M006: "Perjalanan Dinas",
  M007: "Diklat & Pelatihan",
  M008: "SKP (Sasaran Kinerja Pegawai)",
  M009: "Database Kepegawaian",
  M010: "Arsip Digital Kepegawaian",
  M011: "Surat Masuk",
  M012: "Surat Keluar",
  M013: "Disposisi Surat",
  M014: "Agenda Kegiatan",
  M015: "Notulensi Rapat",
  M016: "Data Aset Barang",
  M017: "Data Kendaraan Dinas",
  M018: "Pemeliharaan Aset",
  M019: "Mutasi Aset",
  M020: "DPA (Dokumen Pelaksanaan Anggaran)",
  M021: "RKA (Rencana Kerja dan Anggaran)",
  M022: "SPJ (Surat Pertanggungjawaban)",
  M023: "Realisasi Anggaran",
  M024: "Belanja Pegawai",
  M025: "Belanja Barang",
  M026: "Belanja Modal",
  M027: "Renstra (Rencana Strategis)",
  M028: "Renja (Rencana Kerja)",
  M029: "RKPD",
  M030: "LAKIP (Laporan Akuntabilitas Kinerja)",
  M031: "Monitoring & Evaluasi",
  M032: "Data Komoditas Pangan",
  M033: "Data Produksi Pangan",
  M034: "Stok Pangan Gudang",
  M035: "Neraca Pangan",
  M036: "Peta Kerawanan Pangan",
  M037: "Indeks Ketahanan Pangan",
  M038: "Early Warning Ketersediaan",
  M039: "Data Bencana Dampak Pangan",
  M040: "Luas Panen",
  M041: "Produktivitas Pangan",
  M042: "Data Pasar",
  M043: "Harga Pangan Harian",
  M044: "Inflasi Pangan Bulanan",
  M045: "Inflasi per Komoditas",
  M046: "Dashboard Inflasi TPID",
  M047: "Distribusi Pangan",
  M048: "CPPD (Cadangan Pangan Pemerintah Daerah)",
  M049: "CBP BULOG",
  M050: "Pelepasan Cadangan",
  M051: "Operasi Pasar",
  M052: "Gerakan Pangan Murah",
  M053: "Bantuan Pangan Pemerintah",
  M054: "Rapat TPID",
  M055: "Analisis Pasokan",
  M056: "Data Konsumsi Pangan",
  M057: "Pola Pangan Harapan (PPH)",
  M058: "Data SPPG Penerima",
  M059: "SPPG Distribusi",
  M060: "Program Makan Bergizi Gratis",
  M061: "Program B2SA",
  M062: "Diversifikasi Pangan",
  M063: "Inspeksi Keamanan Pangan",
  M064: "Data Keracunan Pangan",
  M065: "Edukasi Konsumsi Pangan",
  M066: "Data UMKM Pangan",
  M067: "Pembinaan UMKM",
  M068: "Sertifikasi Prima",
  M069: "Sertifikasi GMP/NKV",
  M070: "Sertifikasi GFP",
  M071: "Sertifikasi GHP",
  M072: "Audit Pangan",
  M073: "Registrasi Produk",
  M074: "Uji Laboratorium",
  M075: "Hasil Uji Kimia",
  M076: "Hasil Uji Mikrobiologi",
  M077: "Hasil Uji Fisik",
  M078: "Pengawasan Pangan Berisiko",
  M079: "Sampling Pangan",
  M080: "Database UMKM Tersertifikasi",
  M081: "Laporan Masyarakat",
  M082: "Portal Data Terbuka",
  M083: "Dataset Publik",
  M084: "Request Data Peneliti",
  SA01: "Dashboard KPI 50 Indikator",
  SA02: "Dynamic Module Generator",
  SA03: "Template Tata Naskah Dinas",
  SA04: "Repositori Peraturan",
  SA05: "User Management",
  SA06: "Audit Trail",
  SA07: "System Configuration",
  SA08: "Backup & Restore",
  SA09: "Dashboard Compliance",
  SA10: "AI Configuration",
};

// moduleIconById dihapus karena tidak digunakan

const toHeroIconComponentName = (iconName) =>
  `${iconName
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("")}Icon`;

const renderModuleIcon = (iconValue) => {
  if (typeof iconValue !== "string" || iconValue.length === 0) {
    return "📄";
  }

  if (!iconValue.includes("-")) {
    return iconValue;
  }

  const iconComponentName = toHeroIconComponentName(iconValue);
  const IconComponent = HeroIcons[iconComponentName];

  if (!IconComponent) {
    return "📄";
  }

  return <IconComponent className="h-5 w-5" aria-hidden="true" />;
};

export default function DashboardLayout({ children }) {
  const location = useLocation();
  // Hide sidebar if on main dashboard
  const isMainDashboard = location.pathname === "/";
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  // expandedCategories dihapus karena tidak digunakan
  // State untuk search bar sidebar
  const [search, setSearch] = useState("");

  // Detect if children is a form (very basic: check for form element or prop)
  const isFormMode = useMemo(() => {
    if (!children) return false;
    // If children is a React element and type is 'form' or has a prop 'formMode'
    if (isValidElement(children)) {
      if (children.type === "form") return true;
      if (children.props && children.props.formMode) return true;
    }
    // If children is an array, check if any is a form
    if (Array.isArray(children)) {
      return children.some(
        (child) =>
          isValidElement(child) &&
          (child.type === "form" || (child.props && child.props.formMode)),
      );
    }
    return false;
  }, [children]);

  // Group modules for sidebar (sekaligus filtering role)
  const moduleGroups = useMemo(() => {
    if (!user) return [];
    // Dapatkan allowedModuleIds sesuai role
    let allowedModuleIds = null;
    if (user.role !== "super_admin") {
      const allowedCategories = roleModuleAccess[user.role] || [];
      if (allowedCategories.length === 0 && user.unit_kerja) {
        const normalized = user.unit_kerja.trim().toLowerCase();
        for (const cat of [
          "Sekretariat",
          "Bidang Ketersediaan",
          "Bidang Distribusi",
          "Bidang Konsumsi",
          "UPTD",
        ]) {
          if (cat.toLowerCase() === normalized) allowedCategories.push(cat);
        }
      }
      if (allowedCategories.length === 0) return [];
      let ids = [];
      for (const cat of allowedCategories) {
        if (cat.startsWith("Sekretariat:")) {
          const [mainCat] = cat.split(":");
          const group = defaultModules.find((g) => g.category === mainCat);
          if (group) {
            ids = ids.concat(
              group.items
                .filter(
                  (item) =>
                    item.name.toLowerCase().includes("keuangan") ||
                    item.name.toLowerCase().includes("anggaran") ||
                    item.name.toLowerCase().includes("dpa") ||
                    item.name.toLowerCase().includes("spj") ||
                    item.name.toLowerCase().includes("belanja") ||
                    item.name.toLowerCase().includes("realisasi") ||
                    item.name.toLowerCase().includes("rka") ||
                    item.name.toLowerCase().includes("renstra") ||
                    item.name.toLowerCase().includes("renja") ||
                    item.name.toLowerCase().includes("laporan keuangan") ||
                    item.name.toLowerCase().includes("monitoring"),
                )
                .map((item) => item.id),
            );
            if (missingModuleIdsByCategory[mainCat]) {
              ids = ids.concat(
                missingModuleIdsByCategory[mainCat].filter((id) => {
                  const name = moduleNameById[id]?.toLowerCase() || "";
                  return (
                    name.includes("keuangan") ||
                    name.includes("anggaran") ||
                    name.includes("dpa") ||
                    name.includes("spj") ||
                    name.includes("belanja") ||
                    name.includes("realisasi") ||
                    name.includes("rka") ||
                    name.includes("renstra") ||
                    name.includes("renja") ||
                    name.includes("laporan keuangan") ||
                    name.includes("monitoring")
                  );
                }),
              );
            }
          }
        } else {
          const group = defaultModules.find((g) => g.category === cat);
          if (group) {
            ids = ids.concat(group.items.map((item) => item.id));
            if (missingModuleIdsByCategory[cat]) {
              ids = ids.concat(missingModuleIdsByCategory[cat]);
            }
          }
        }
      }
      allowedModuleIds = ids;
    }
    // Build moduleGroups sesuai allowedModuleIds
    return defaultModules
      .map((categoryGroup) => {
        const existingIds = new Set(categoryGroup.items.map((item) => item.id));
        const extraItems = (
          missingModuleIdsByCategory[categoryGroup.category] || []
        )
          .filter((id) => !existingIds.has(id))
          .map((id) => ({
            id,
            name: moduleNameById[id] || id,
            icon: "📄",
          }));
        const allItems = [...categoryGroup.items, ...extraItems].filter(
          (item) =>
            allowedModuleIds === null || allowedModuleIds.includes(item.id),
        );
        if (allItems.length === 0) return null;
        return {
          ...categoryGroup,
          items: allItems,
        };
      })
      .filter(Boolean);
  }, [user]);

  // toggleCategory dihapus karena tidak digunakan

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Refactor shell layout
  return (
    <div className="min-h-screen bg-bg text-primary font-inter">
      <div className="flex min-h-screen">
        {/* Sidebar hanya tampil jika bukan dashboard utama */}
        {!isMainDashboard && (
          <aside
            className={`transition-all duration-300 flex flex-col border-r border-neutral-300 bg-white shadow-sm w-[260px]`}
          >
            <div className="px-4 py-5 border-b border-neutral-300 flex items-center justify-between">
              {sidebarOpen ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    SIGAP
                  </p>
                  <h1 className="text-lg font-display text-primary">
                    Malut Command
                  </h1>
                  <p className="text-xs text-muted">Dinas Pangan</p>
                </div>
              ) : (
                <span className="text-xl font-bold text-primary">S</span>
              )}
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-full border border-neutral-300 bg-bg p-2 text-primary transition hover:border-primary hover:text-primary"
                title="Toggle Sidebar"
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
            </div>
            {/* Sidebar nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari modul..."
                  className="w-full px-3 py-2 rounded bg-neutral-300 text-primary placeholder:text-muted border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                {moduleGroups
                  .map((category) => {
                    const filteredItems =
                      search.trim() === ""
                        ? category.items
                        : category.items.filter((item) =>
                            item.name
                              .toLowerCase()
                              .includes(search.trim().toLowerCase()),
                          );
                    if (filteredItems.length === 0) return null;
                    return (
                      <div key={category.category} className="mt-2">
                        <div className="font-bold text-xs uppercase text-muted mb-1 flex items-center gap-2">
                          {renderModuleIcon(filteredItems[0]?.icon)}
                          {sidebarOpen && category.category}
                        </div>
                        <div className="flex flex-col gap-1">
                          {filteredItems.map((item) => (
                            <Link
                              key={item.id}
                              to={
                                item.id === "CHATBOT"
                                  ? "/chatbot-upload"
                                  : `/module/${item.id.toLowerCase()}`
                              }
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                location.pathname ===
                                (item.id === "CHATBOT"
                                  ? "/chatbot-upload"
                                  : `/module/${item.id.toLowerCase()}`)
                                  ? "bg-primary text-white shadow"
                                  : "text-primary hover:bg-neutral-200"
                              }`}
                              aria-label={item.name}
                            >
                              <span className="text-base">
                                {renderModuleIcon(item.icon)}
                              </span>
                              {sidebarOpen && (
                                <span className="truncate font-medium">
                                  {item.name}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
              {/* Floating Action Button (FAB) */}
              <button
                className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-primary-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition"
                title="Tambah Data Baru"
                onClick={() => {
                  navigate("/module/tambah");
                }}
                style={{ boxShadow: "0 4px 24px 0 rgba(24, 144, 255, 0.2)" }}
              >
                <span className="text-xl">＋</span>
                <span className="hidden md:inline">Tambah Data</span>
              </button>
            </nav>
            {sidebarOpen && (
              <div className="px-4 py-4 border-t border-neutral-300">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {user?.nama_lengkap || "User"}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {user?.role || "role"}
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-neutral-300 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  SIGAP Malut
                </p>
                <h2 className="text-2xl font-display text-primary">
                  {location.pathname === "/dashboard"
                    ? "Dashboard Eksekutif"
                    : "Ruang Kerja Modul"}
                </h2>
                <p className="text-sm text-muted">
                  {user?.unit_kerja || "Unit Kerja"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm text-muted shadow-soft-sm hidden md:flex">
                  <span>Cari</span>
                  <input
                    type="text"
                    placeholder="modul, laporan, atau data"
                    className="w-56 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
                  />
                </div>
                <div className="flex-col items-end text-right hidden sm:flex">
                  <span className="text-sm font-semibold text-primary">
                    {user?.nama_lengkap || "User"}
                  </span>
                  <span className="text-xs text-muted">
                    {user?.role || "role"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-neutral-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          {/* Main grid content */}
          <main className="flex-1 overflow-y-auto px-8 py-8">
            {isFormMode ? (
              <div className="mx-auto max-w-3xl bg-white rounded-xl shadow p-8">
                {children}
              </div>
            ) : (
              <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Panel Ringkasan Eksekutif & Alert */}
                <div className="md:col-span-8 col-span-1 flex flex-col gap-6">
                  {/* Children (panel dinamis) */}
                  <div>{children}</div>
                  {/* Ringkasan Eksekutif */}
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                    <h3 className="text-lg font-bold mb-2">
                      Ringkasan Eksekutif
                    </h3>
                    <p className="text-sm text-muted mb-2">
                      Dashboard Kendali SIGAP Malut
                      <br />
                      Pantau indikator kinerja utama, alur koordinasi, serta
                      kesiapan data lintas bidang untuk keputusan cepat.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">190+</span>
                        <span className="text-xs text-muted">Modul</span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">4</span>
                        <span className="text-xs text-muted">Surat Masuk</span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">5</span>
                        <span className="text-xs text-muted">Surat Keluar</span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">14</span>
                        <span className="text-xs text-muted">Komoditas</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">15</span>
                        <span className="text-xs text-muted">
                          Pengguna Aktif
                        </span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">3 kasus</span>
                        <span className="text-xs text-muted">
                          Alert Prioritas
                        </span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">Kritis</span>
                        <span className="text-xs text-muted">
                          KGB Terlambat
                        </span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
                        <span className="text-2xl font-bold">Warning</span>
                        <span className="text-xs text-muted">
                          Compliance Koordinasi
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Alert Prioritas Minggu Ini */}
                  <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 flex flex-col gap-1">
                    <div className="font-bold text-red-700">
                      Alert Prioritas Minggu Ini
                    </div>
                    <div className="text-sm text-red-800">
                      1 pegawai melewati tenggat 30 hari.
                    </div>
                    <div className="text-xs text-red-600">
                      2 bypass terdeteksi pada alur Sekretariat.
                    </div>
                    <div className="text-xs text-orange-600">
                      Harga cabai naik 5% minggu ini.
                    </div>
                  </div>
                  {/* Akses Cepat */}
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                    <div className="font-bold mb-2">Akses Cepat</div>
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-white text-primary border border-primary rounded px-4 py-2 text-xs font-semibold shadow hover:bg-primary hover:text-white transition">
                        Dashboard Inflasi
                      </button>
                      <button className="bg-white text-primary border border-primary rounded px-4 py-2 text-xs font-semibold shadow hover:bg-primary hover:text-white transition">
                        Ringkasan Kepegawaian
                      </button>
                      <button className="bg-white text-primary border border-primary rounded px-4 py-2 text-xs font-semibold shadow hover:bg-primary hover:text-white transition">
                        Laporan Distribusi
                      </button>
                      <button className="bg-white text-primary border border-primary rounded px-4 py-2 text-xs font-semibold shadow hover:bg-primary hover:text-white transition">
                        Data SPPG
                      </button>
                      <button className="bg-white text-primary border border-primary rounded px-4 py-2 text-xs font-semibold shadow hover:bg-primary hover:text-white transition">
                        Portal Publik
                      </button>
                    </div>
                  </div>
                </div>
                {/* Panel Kinerja Bulanan & Ringkasan Laporan Strategis */}
                <div className="md:col-span-4 col-span-1 flex flex-col gap-6">
                  {/* Kinerja Bulanan */}
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                    <div className="font-bold mb-2">Kinerja Bulanan</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span>Sekretariat</span>
                        <span className="font-bold text-green-600">84%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ketersediaan</span>
                        <span className="font-bold text-green-600">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Distribusi</span>
                        <span className="font-bold text-green-600">81%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Konsumsi</span>
                        <span className="font-bold text-green-600">76%</span>
                      </div>
                    </div>
                  </div>
                  {/* Ringkasan Laporan Strategis */}
                  <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
                    <div className="font-bold mb-2">
                      Ringkasan Laporan Strategis
                    </div>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Laporan Inflasi:</span>{" "}
                        Siap untuk rapat TPID minggu ini.
                      </div>
                      <div>
                        <span className="font-semibold">Rekap SPPG:</span> Data
                        valid 100% untuk pelaporan nasional.
                      </div>
                      <div>
                        <span className="font-semibold">Kinerja Bidang:</span>{" "}
                        Ringkasan KPI bulanan sudah tersusun.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
