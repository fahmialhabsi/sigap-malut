import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

export default function LoginPage() {
  const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // Hapus roleParam karena tidak digunakan
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Mapping role/unit_kerja ke dashboard
  const dashboardMapping = {
    super_admin: "/dashboard/superadmin",
    kepala_dinas: "/dashboard/superadmin",
    Sekretariat: "/dashboard/sekretariat",
    "Bidang Ketersediaan": "/dashboard/ketersediaan",
    "Bidang Distribusi": "/dashboard/distribusi",
    "Bidang Konsumsi": "/dashboard/konsumsi",
    UPTD: "/dashboard/uptd",
    kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
    kepala_bidang_distribusi: "/dashboard/distribusi",
    kepala_bidang_konsumsi: "/dashboard/konsumsi",
    "Bidang Distribusi dan Cadangan Pangan": "/dashboard/distribusi",
    // Tambahkan mapping lain jika diperlukan
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Debug: inspect result from store/login
      // eslint-disable-next-line no-console
      console.debug("LoginPage: login result=", result);
      // Jika backend memberikan redirect, ikuti itu terlebih dahulu
      if (result && result.redirect) {
        // Only navigate if redirect is a string (avoid object -> /[object Object])
        if (typeof result.redirect === "string") {
          // eslint-disable-next-line no-console
          console.debug("LoginPage: navigating to redirect=", result.redirect);
          navigate(result.redirect);
          setLoading(false);
          return;
        }
        // Log unexpected redirect type and fall through to mapping
        // eslint-disable-next-line no-console
        console.warn(
          "LoginPage: unexpected redirect type, falling back:",
          result.redirect,
        );
      }

      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user"));
      } catch (e) {
        // ignore JSON parse error
      }

      const roleIdToName = {
        "167289b5-bcdb-4749-a404-f6e1360a9c86": "super_admin",
        // ... tambahkan lainnya
      };

      if (user) {
        // Prioritaskan role, lalu unit_kerja
        let dashboardPath = null;
        if (user.role && dashboardMapping[user.role]) {
          dashboardPath = dashboardMapping[user.role];
        } else if (user.unit_kerja && dashboardMapping[user.unit_kerja]) {
          dashboardPath = dashboardMapping[user.unit_kerja];
        }
        navigate(dashboardPath || "/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SIGAP Malut</h1>
          <p className="text-gray-500 mt-2">Sistem Informasi Dinas Pangan</p>
          <p className="text-sm text-gray-400">Provinsi Maluku Utara</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">
            Demo Credentials:
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              • Super Admin:
              <code>
                super_admin-sekretariat-dinas-pangan-maluku-utara@dinpangan.go.id
                / Admin123
              </code>
            </p>
            <p>
              • Kepala Dinas:{" "}
              <code className="bg-gray-200 px-1 py-0.5 rounded">
                kepala.dinas / Kadis123
              </code>
            </p>
            <p>
              • Staff:{" "}
              <code className="bg-gray-200 px-1 py-0.5 rounded">
                staff.sekretariat / Staff123
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
