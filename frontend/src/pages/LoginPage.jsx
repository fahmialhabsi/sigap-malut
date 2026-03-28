// frontend/src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";
import { getDashboardPath } from "../utils/getDashboardPath";
import { normalizeUser } from "../stores/authStore";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function normalizeUnit(user) {
  const v = user?.unit_kerja || user?.unit_id || "";
  return v ? String(v).toLowerCase() : "";
}

export default function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role"); // UI only: gubernur / kepala_bidang_konsumsi / dll

  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result?.success) {
      // Pull stored user (authStore should persist it)
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user"));
      } catch {}

      // Re-normalisasi user agar roleIdToName sudah terisi (fix super_admin)
      user = normalizeUser(user);

      // DEBUG LOG: cek hasil login dan role
      // eslint-disable-next-line no-console
      console.log("[DEBUG] Login result user (normalized):", user);
      // Tambahan log untuk roleIdToName dan role_id
      // eslint-disable-next-line no-console
      console.log(
        "[DEBUG] user.role:",
        user.role,
        "user.role_id:",
        user.role_id,
        "roleIdToName:",
        roleIdToName,
      );

      // Selalu gunakan getDashboardPath untuk redirect
      try {
        const inferredPath = getDashboardPath(user);
        // eslint-disable-next-line no-console
        console.log("[DEBUG] inferredPath:", inferredPath);
        if (inferredPath) {
          setLoading(false);
          navigate(inferredPath, { replace: true });
          return; // pastikan langsung return, tidak lanjut ke bawah
        }
      } catch (err) {
        // ignore error here but you can uncomment to debug
        // console.error("getDashboardPath error:", err);
      }
      setLoading(false);
      // Jika mapping gagal, fallback ke /dashboard
      navigate("/dashboard", { replace: true });
      return;
    }

    setError(result?.message || "Login gagal");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
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
                d="M12 11c1.656 0 3-1.567 3-3.5S13.656 4 12 4 9 5.567 9 7.5 10.344 11 12 11zm0 2c-3.314 0-6 1.791-6 4v1h12v-1c0-2.209-2.686-4-6-4z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SIGAP Malut</h1>
          {roleParam && (
            <p className="text-xs text-gray-500 mt-2">
              Login untuk: <span className="font-semibold">{roleParam}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
