import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const modules = [
  {
    category: "Sekretariat",
    items: [
      { id: "SEK-ADM", name: "Administrasi Umum", icon: "📄" },
      { id: "SEK-KEP", name: "Kepegawaian", icon: "👥" },
      { id: "SEK-KEU", name: "Keuangan", icon: "💰" },
      { id: "SEK-REN", name: "Perencanaan", icon: "📊" },
      { id: "SEK-AST", name: "Aset", icon: "🏢" },
    ],
  },
  {
    category: "Bidang Ketersediaan",
    items: [
      { id: "BKT-PGD", name: "Produksi Pangan", icon: "🌾" },
      { id: "BKT-KRW", name: "Kerawanan Pangan", icon: "⚠️" },
      { id: "BKT-FSL", name: "Fasilitasi", icon: "🤝" },
      { id: "BKT-KBJ", name: "Kebijakan", icon: "📋" },
    ],
  },
  {
    category: "Bidang Distribusi",
    items: [
      { id: "BDS-HRG", name: "Harga Pangan", icon: "💵" },
      { id: "BDS-CPD", name: "Cadangan Pangan", icon: "📦" },
      { id: "BDS-MON", name: "Monitoring", icon: "📈" },
      { id: "BDS-KBJ", name: "Kebijakan", icon: "📋" },
    ],
  },
  {
    category: "Bidang Konsumsi",
    items: [
      { id: "BKS-KMN", name: "Keamanan Pangan", icon: "🛡️" },
      { id: "BKS-DVR", name: "Diversifikasi", icon: "🍽️" },
      { id: "BKS-BMB", name: "Bimbingan Masyarakat", icon: "👨‍🏫" },
      { id: "BKS-KBJ", name: "Kebijakan", icon: "📋" },
    ],
  },
  {
    category: "UPTD",
    items: [
      { id: "UPT-MTU", name: "Mutu Pangan", icon: "🔬" },
      { id: "UPT-TKN", name: "Teknis", icon: "⚙️" },
      { id: "UPT-ADM", name: "Administrasi", icon: "📑" },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(["Sekretariat"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

          {modules.map((category) => (
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
