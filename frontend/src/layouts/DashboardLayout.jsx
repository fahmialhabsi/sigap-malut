import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import api from "../utils/api";

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
      { id: "M056", name: "Data Konsumsi", icon: "🍽️" },
      { id: "M058", name: "Data SPPG", icon: "👥" },
      { id: "M063", name: "Inspeksi Keamanan", icon: "🔍" },
      { id: "M066", name: "Data UMKM Pangan", icon: "🏭" },
    ],
  },
  {
    category: "UPTD",
    items: [
      { id: "M068", name: "Sertifikasi Prima", icon: "✅" },
      { id: "M072", name: "Audit Pangan", icon: "📋" },
      { id: "M074", name: "Uji Laboratorium", icon: "🧪" },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(["Sekretariat"]);
  const [moduleGroups, setModuleGroups] = useState(defaultModules);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isSuperAdmin = useMemo(() => user?.role === "super_admin", [user]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setModuleGroups(defaultModules);
      return;
    }

    let isMounted = true;

    const fetchModules = async () => {
      try {
        const response = await api.get("/modules");
        const items = response.data.data || [];

        const grouped = items.reduce((acc, item) => {
          const category = item.bidang || "Lainnya";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({
            id: item.modul_id,
            name: item.nama_modul,
            icon: "📄",
          });
          return acc;
        }, {});

        const groups = Object.keys(grouped).map((category) => ({
          category,
          items: grouped[category],
        }));

        if (isMounted && groups.length > 0) {
          setModuleGroups(groups);
          setExpandedCategories([groups[0].category]);
        }
      } catch (error) {
        console.error("Gagal memuat daftar modul:", error);
      }
    };

    fetchModules();

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin]);

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold">SIGAP Malut</h1>
                <p className="text-xs text-gray-400">Dinas Pangan</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-2 ${
              location.pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800"
            }`}
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          {moduleGroups.map((category) => (
            <div key={category.category} className="mb-2">
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800 rounded-lg text-left"
              >
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-semibold">
                      {category.category}
                    </span>
                    <span>
                      {expandedCategories.includes(category.category)
                        ? "▼"
                        : "▶"}
                    </span>
                  </>
                )}
              </button>

              {expandedCategories.includes(category.category) && (
                <div className="ml-2 mt-1 space-y-1">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/module/${item.id.toLowerCase()}`}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                        location.pathname === `/module/${item.id.toLowerCase()}`
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <span>{item.icon}</span>
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.nama_lengkap}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {location.pathname === "/dashboard"
                  ? "Dashboard"
                  : "Module Detail"}
              </h2>
              <p className="text-sm text-gray-500">{user?.unit_kerja}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
