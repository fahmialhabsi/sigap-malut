import { useMemo, useState } from "react";
import * as HeroIcons from "@heroicons/react/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

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

const moduleIconById = {
  M001: "user-group",
  M002: "calendar-days",
  M003: "arrow-trending-up",
  M004: "trophy",
  M005: "calendar",
  M006: "map",
  M007: "academic-cap",
  M008: "clipboard-document-check",
  M009: "folder-open",
  M010: "archive-box",
  M011: "inbox-arrow-down",
  M012: "paper-airplane",
  M013: "arrow-path",
  M014: "calendar-days",
  M015: "document-text",
  M016: "cube",
  M017: "truck",
  M018: "wrench-screwdriver",
  M019: "arrow-right-circle",
  M020: "banknotes",
  M021: "document-chart-bar",
  M022: "receipt-percent",
  M023: "chart-pie",
  M024: "banknotes",
  M025: "shopping-cart",
  M026: "building-office",
  M027: "map",
  M028: "clipboard-document-list",
  M029: "building-office-2",
  M030: "document-chart-bar",
  M031: "magnifying-glass-chart",
  M032: "shopping-bag",
  M033: "chart-bar",
  M034: "archive-box",
  M035: "scale",
  M036: "map-pin",
  M037: "chart-bar-square",
  M038: "bell-alert",
  M039: "exclamation-triangle",
  M040: "arrows-pointing-out",
  M041: "chart-bar",
  M042: "building-storefront",
  M043: "currency-dollar",
  M044: "arrow-trending-up",
  M045: "list-bullet",
  M046: "presentation-chart-line",
  M047: "truck",
  M048: "archive-box-arrow-down",
  M049: "building-library",
  M050: "arrow-up-tray",
  M051: "shopping-cart",
  M052: "hand-raised",
  M053: "gift",
  M054: "users",
  M055: "chart-pie",
  M056: "utensils",
  M057: "chart-bar",
  M058: "user-group",
  M059: "truck",
  M060: "heart",
  M061: "shield-check",
  M062: "arrows-pointing-out",
  M063: "magnifying-glass",
  M064: "exclamation-circle",
  M065: "academic-cap",
  M066: "building-storefront",
  M067: "hand-raised",
  M068: "shield-check",
  M069: "check-badge",
  M070: "globe-alt",
  M071: "hand-thumb-up",
  M072: "clipboard-document-check",
  M073: "document-plus",
  M074: "beaker",
  M075: "test-tube",
  M076: "virus",
  M077: "scale",
  M078: "eye",
  M079: "cube",
  M080: "building-office",
  M081: "chat-bubble-left-right",
  M082: "globe-alt",
  M083: "folder-arrow-down",
  M084: "document-magnifying-glass",
  SA01: "chart-bar-square",
  SA02: "puzzle-piece",
  SA03: "document-text",
  SA04: "book-open",
  SA05: "users",
  SA06: "clipboard-document-list",
  SA07: "cog-6-tooth",
  SA08: "cloud-arrow-down",
  SA09: "shield-check",
  SA10: "sparkles",
};

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
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(
    defaultModules.map((module) => module.category),
  );

  // Determine allowed modules for this user
  const allowedModuleIds = useMemo(() => {
    if (!user) return [];
    if (user.role === "super_admin") return null; // null means all allowed
    // Map unit_kerja to category name in defaultModules
    // E.g. "Bidang Ketersediaan", "Bidang Distribusi", "Bidang Konsumsi", "UPTD", "Sekretariat"
    // user.unit_kerja is expected to match one of these
    // If not, fallback to empty
    const allowedCategories = [];
    if (user.unit_kerja) {
      // Normalize for matching
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
    // Collect all module ids for allowed categories
    let ids = [];
    for (const cat of allowedCategories) {
      const group = defaultModules.find((g) => g.category === cat);
      if (group) {
        ids = ids.concat(group.items.map((item) => item.id));
        // Add missingModuleIdsByCategory
        if (missingModuleIdsByCategory[cat]) {
          ids = ids.concat(missingModuleIdsByCategory[cat]);
        }
      }
    }
    return ids;
  }, [user]);

  const moduleGroups = useMemo(() => {
    // If super_admin, show all
    if (!user || user.role === "super_admin") {
      return defaultModules.map((categoryGroup) => {
        const existingIds = new Set(categoryGroup.items.map((item) => item.id));
        const extraItems = (
          missingModuleIdsByCategory[categoryGroup.category] || []
        )
          .filter((id) => !existingIds.has(id))
          .map((id) => ({
            id,
            name: moduleNameById[id] || id,
            icon: moduleIconById[id] || "📄",
          }));
        return {
          ...categoryGroup,
          items: [...categoryGroup.items, ...extraItems],
        };
      });
    }
    // Otherwise, filter modules by allowedModuleIds
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
            icon: moduleIconById[id] || "📄",
          }));
        // Filter items by allowedModuleIds
        const allItems = [...categoryGroup.items, ...extraItems].filter(
          (item) => allowedModuleIds.includes(item.id),
        );
        if (allItems.length === 0) return null;
        return {
          ...categoryGroup,
          items: allItems,
        };
      })
      .filter(Boolean);
  }, [user, allowedModuleIds]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-20"
          } bg-slate-950 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-900`}
        >
          <div className="px-4 py-5 border-b border-slate-900">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    SIGAP
                  </p>
                  <h1 className="text-lg font-display text-slate-100">
                    Malut Command
                  </h1>
                  <p className="text-xs text-slate-500">Dinas Pangan</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-full border border-slate-800 bg-slate-900/70 p-2 text-slate-200 transition hover:border-slate-700 hover:text-white"
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                location.pathname === "/dashboard"
                  ? "bg-accent text-white shadow-soft-sm"
                  : "text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="text-base">🏠</span>
              {sidebarOpen && <span>Dashboard</span>}
            </Link>

            {moduleGroups.map((category) => (
              <div key={category.category} className="mt-5">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-slate-900/40"
                >
                  {sidebarOpen ? (
                    <>
                      <span>{category.category}</span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                          {category.items.length}
                        </span>
                        <span>
                          {expandedCategories.includes(category.category)
                            ? "▼"
                            : "▶"}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="mx-auto">●</span>
                  )}
                </button>

                {expandedCategories.includes(category.category) && (
                  <div className="ml-2 mt-2 space-y-1">
                    {category.items.map((item) => {
                      if (item.id === "CHATBOT") {
                        return (
                          <Link
                            key={item.id}
                            to="/chatbot-upload"
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                              location.pathname === "/chatbot-upload"
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-300 hover:bg-slate-900/70"
                            }`}
                          >
                            <span className="text-base">
                              {renderModuleIcon(item.icon)}
                            </span>
                            {sidebarOpen && <span>{item.name}</span>}
                          </Link>
                        );
                      } else {
                        return (
                          <Link
                            key={item.id}
                            to={`/module/${item.id.toLowerCase()}`}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                              location.pathname ===
                              `/module/${item.id.toLowerCase()}`
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-300 hover:bg-slate-900/70"
                            }`}
                          >
                            <span className="text-base">
                              {renderModuleIcon(item.icon)}
                            </span>
                            {sidebarOpen && <span>{item.name}</span>}
                          </Link>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="px-4 py-4 border-t border-slate-900">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {user?.nama_lengkap || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role || "role"}
                </p>
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  SIGAP Malut
                </p>
                <h2 className="text-2xl font-display text-ink">
                  {location.pathname === "/dashboard"
                    ? "Dashboard Eksekutif"
                    : "Ruang Kerja Modul"}
                </h2>
                <p className="text-sm text-muted">
                  {user?.unit_kerja || "Unit Kerja"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-muted shadow-soft-sm md:flex">
                  <span>Cari</span>
                  <input
                    type="text"
                    placeholder="modul, laporan, atau data"
                    className="w-56 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                  />
                </div>
                <div className="hidden flex-col items-end text-right sm:flex">
                  <span className="text-sm font-semibold text-ink">
                    {user?.nama_lengkap || "User"}
                  </span>
                  <span className="text-xs text-muted">
                    {user?.role || "role"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
