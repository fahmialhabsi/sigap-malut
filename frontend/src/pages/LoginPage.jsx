import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

export default function LoginPage() {
  const location = useLocation();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role");

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Mapping role/unit_kerja ke dashboard
  // Keys should match the `value` used in LandingPage role buttons
  const dashboardMapping = {
    super_admin: "/dashboard/superadmin",
    gubernur: "/dashboard/superadmin",
    sekretaris: "/dashboard/sekretariat",
    kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
    kepala_bidang_distribusi: "/dashboard/distribusi",
    kepala_bidang_konsumsi: "/dashboard/konsumsi",
    kepala_uptd: "/dashboard/uptd",
    publik: "/dashboard-publik",
    // Add more mappings if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LoginPage: handleSubmit fired", { email, password });
    setError("");
    setLoading(true);

    console.log("LoginPage: login function type", typeof login, {
      hasLogin: !!login,
    });
    let result;
    try {
      if (typeof login !== "function")
        throw new Error("authStore.login is not a function");
      result = await login(email, password);
      console.log("LoginPage: login result", result);
    } catch (err) {
      console.error("LoginPage: login threw error", err);
      setError(err?.message || "Login gagal (client)");
      setLoading(false);
      return;
    }

    if (!result || !result.success) {
      setError(result?.message || "Email atau password salah");
      setLoading(false);
      return;
    }

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
      console.warn("LoginPage: failed to parse user from localStorage", err);
    }

    // Prioritize explicit role selected on LandingPage (via ?role=...)
    if (roleParam) {
      const mapped = dashboardMapping[roleParam];
      console.log("LoginPage: roleParam", { roleParam, mapped });
      if (mapped != null) {
        const coerced =
          typeof mapped === "string"
            ? mapped
            : mapped && typeof mapped.pathname === "string"
              ? mapped.pathname
              : String(mapped);
        try {
          navigate(coerced);
        } catch (err) {
          console.error("Navigate error (roleParam):", err, {
            mapped,
            coerced,
          });
          window.location.href = coerced;
        }
        setLoading(false);
        return;
      } else {
        console.warn(
          `LoginPage: unknown roleParam="${roleParam}". Falling back to user-derived dashboard.`,
        );
      }
    }

    // Fallback: derive from authenticated `user`
    if (user) {
      const roleKey = roleIdToName[user.role_id] || user.role;
      // tolerate different unit field names returned by backend
      const unitVal = user.unit_kerja || user.unit_id || user.unit || "";
      const uk = unitVal ? String(unitVal).toLowerCase() : "";

      let dashboardPath =
        roleKey && dashboardMapping[roleKey] ? dashboardMapping[roleKey] : null;

      // If roleKey is generic like "kepala_bidang", use unit to pick specific bidang
      if (
        !dashboardPath &&
        String(roleKey || "")
          .toLowerCase()
          .startsWith("kepala_bidang")
      ) {
        if (uk.includes("ketersediaan"))
          dashboardPath = "/dashboard/ketersediaan";
        else if (uk.includes("distribusi"))
          dashboardPath = "/dashboard/distribusi";
        else if (uk.includes("konsumsi")) dashboardPath = "/dashboard/konsumsi";
        else if (uk.includes("sekretariat"))
          dashboardPath = "/dashboard/sekretariat";
        else if (uk.includes("uptd")) dashboardPath = "/dashboard/uptd";
      }

      // As a final fallback, if mapping still missing, try to derive purely from unit
      if (!dashboardPath && uk) {
        if (uk.includes("ketersediaan"))
          dashboardPath = "/dashboard/ketersediaan";
        else if (uk.includes("distribusi"))
          dashboardPath = "/dashboard/distribusi";
        else if (uk.includes("konsumsi")) dashboardPath = "/dashboard/konsumsi";
        else if (uk.includes("sekretariat"))
          dashboardPath = "/dashboard/sekretariat";
        else if (uk.includes("uptd")) dashboardPath = "/dashboard/uptd";
      }

      console.log("LoginPage: redirect decision", {
        roleKey,
        dashboardPath,
        user,
      });

      let coercedPath = dashboardPath;
      if (coercedPath != null && typeof coercedPath !== "string") {
        if (coercedPath && typeof coercedPath.pathname === "string")
          coercedPath = coercedPath.pathname;
        else coercedPath = String(coercedPath);
      }

      try {
        navigate(coercedPath || "/dashboard");
      } catch (err) {
        console.error("Navigate error (fallback):", err, { coercedPath, user });
        try {
          window.location.href = coercedPath || "/dashboard";
        } catch (e) {
          console.error("window.location fallback failed", e);
        }
      }
    } else {
      navigate("/dashboard");
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
      </div>
    </div>
  );
}
