import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

export default function LoginPage() {
  const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // Hapus roleParam karena tidak digunakan
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      // Ambil user dari localStorage (atau bisa dari result jika login mengembalikan user)
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user"));
      } catch (e) {
        // ignore JSON parse error
      }

      if (user) {
        if (user.role === "super_admin") {
          navigate("/dashboard/superadmin");
        } else if (user.unit_kerja === "Sekretariat") {
          navigate("/dashboard/sekretariat");
        } else if (user.unit_kerja === "Bidang Ketersediaan") {
          navigate("/dashboard/ketersediaan");
        } else if (user.unit_kerja === "Bidang Distribusi") {
          navigate("/dashboard/distribusi");
        } else if (user.unit_kerja === "Bidang Konsumsi") {
          navigate("/dashboard/konsumsi");
        } else if (user.unit_kerja === "UPTD") {
          navigate("/dashboard/uptd");
        } else {
          navigate("/dashboard");
        }
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan username"
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
              • Super Admin:{" "}
              <code className="bg-gray-200 px-1 py-0.5 rounded">
                superadmin / Admin123
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
