// frontend/src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { getDashboardPath } from "../utils/getDashboardPath";
import { normalizeRoleKey } from "../utils/normalizeRole";

function normalizeUnit(user) {
  const v = user?.unit_kerja || user?.unit_id || "";
  return v ? String(v).toLowerCase() : "";
}

/**
 * Validasi apakah user yang berhasil login memang berhak masuk
 * melalui portal yang dipilih di landing page.
 * Mengembalikan { allowed: boolean, portalLabel: string }
 */
function validatePortalAccess(roleParam, user) {
  if (!roleParam) return { allowed: true, portalLabel: "" };

  const roleName = normalizeRoleKey(user);
  const unit = normalizeUnit(user);
  const jabatan = (user?.jabatan || "").toLowerCase();

  // Super admin boleh masuk dari portal mana pun
  if (roleName === "super_admin") return { allowed: true, portalLabel: "" };

  const PORTAL_MAP = {
    gubernur: {
      label: "Gubernur",
      check: () => roleName === "gubernur",
    },
    kepala_dinas: {
      label: "Kepala Dinas",
      check: () => roleName === "kepala_dinas" || roleName === "kadin",
    },
    sekretaris: {
      label: "Sekretariat Dinas Pangan",
      check: () =>
        unit.includes("sekretariat") ||
        roleName === "sekretaris" ||
        roleName === "kasubag" ||
        roleName === "kasubag_umum_kepegawaian" ||
        roleName === "kasubbag" ||
        roleName === "kasubbag_umum" ||
        roleName === "kasubbag_kepegawaian" ||
        roleName === "kasubag_kepegawaian" ||
        jabatan.includes("sekretaris") ||
        jabatan.includes("kasubag"),
    },
    kepala_bidang_ketersediaan: {
      label: "Bidang Ketersediaan dan Kerawanan Pangan",
      check: () =>
        unit.includes("ketersediaan") ||
        roleName === "kepala_bidang_ketersediaan" ||
        roleName === "pelaksana_ketersediaan" ||
        roleName === "fungsional_ketersediaan" ||
        jabatan.includes("ketersediaan"),
    },
    kepala_bidang_distribusi: {
      label: "Bidang Distribusi dan Cadangan Pangan",
      check: () =>
        unit.includes("distribusi") ||
        unit.includes("cadangan") ||
        roleName === "kepala_bidang_distribusi" ||
        roleName === "pelaksana_distribusi" ||
        roleName === "fungsional_distribusi" ||
        jabatan.includes("distribusi") ||
        jabatan.includes("cadangan"),
    },
    kepala_bidang_konsumsi: {
      label: "Bidang Konsumsi dan Keamanan Pangan",
      check: () =>
        unit.includes("konsumsi") ||
        unit.includes("keamanan") ||
        roleName === "kepala_bidang_konsumsi" ||
        roleName === "pelaksana_konsumsi" ||
        roleName === "fungsional_konsumsi" ||
        jabatan.includes("konsumsi") ||
        jabatan.includes("keamanan pangan"),
    },
    kepala_uptd: {
      label: "Balai Pengawasan Mutu dan Keamanan Pangan (UPTD)",
      check: () =>
        unit.includes("uptd") ||
        unit.includes("balai") ||
        roleName === "kepala_uptd" ||
        roleName === "kasi_uptd" ||
        roleName === "kasi_mutu" ||
        roleName === "kasi_teknis" ||
        roleName === "kasubag_uptd" ||
        roleName === "kasubbag_tu_uptd" ||
        jabatan.includes("uptd") ||
        jabatan.includes("balai"),
    },
  };

  const portal = PORTAL_MAP[roleParam];
  if (!portal) return { allowed: true, portalLabel: "" };

  return {
    allowed: portal.check(),
    portalLabel: portal.label,
  };
}

// Label portal yang ramah untuk ditampilkan ke pengguna
const PORTAL_LABELS = {
  gubernur: "Gubernur",
  kepala_dinas: "Kepala Dinas",
  sekretaris: "Sekretariat Dinas Pangan",
  kepala_bidang_ketersediaan: "Bidang Ketersediaan dan Kerawanan Pangan",
  kepala_bidang_distribusi: "Bidang Distribusi dan Cadangan Pangan",
  kepala_bidang_konsumsi: "Bidang Konsumsi dan Keamanan Pangan",
  kepala_uptd: "Balai Pengawasan Mutu dan Keamanan Pangan (UPTD)",
  super_admin: "Super Admin",
};

export default function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role");

  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result?.success) {
      // Prefer backend dashboardUrl if available
      const dashboardUrlFromBackend = result?.data?.dashboardUrl;

      // Pull stored user (authStore should persist it)
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user"));
      } catch {}

      // Validasi: apakah user berhak masuk portal ini?
      const { allowed, portalLabel } = validatePortalAccess(roleParam, user);
      if (!allowed) {
        logout();
        const selectedPortal = PORTAL_LABELS[roleParam] || roleParam;
        setError(
          `Akun Anda tidak terdaftar untuk portal "${selectedPortal}". ` +
          `Silakan kembali ke halaman utama dan pilih unit kerja yang sesuai.`
        );
        setLoading(false);
        return;
      }

      const roleName = normalizeRoleKey(user);
      const unit = normalizeUnit(user);

      // 1) Backend dashboardUrl — pakai jika tidak generic
      if (dashboardUrlFromBackend && dashboardUrlFromBackend !== "/dashboard") {
        navigate(dashboardUrlFromBackend, { replace: true });
        setLoading(false);
        return;
      }

      // 2) Inferensi dari role/unit user (utamakan atas intent landing page)
      try {
        const inferredPath = getDashboardPath(user);
        if (inferredPath && inferredPath !== "/dashboard") {
          navigate(inferredPath, { replace: true });
          setLoading(false);
          return;
        }
      } catch {
        /* ignore */
      }

      // 3) Intent dari landing (hanya jika role aktual masih mengarah ke /dashboard generik)
      if (roleParam) {
        if (roleParam === "gubernur") {
          navigate("/dashboard", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "kepala_bidang_ketersediaan") {
          navigate("/dashboard/ketersediaan", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "kepala_bidang_distribusi") {
          navigate("/dashboard/distribusi", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "kepala_bidang_konsumsi") {
          navigate("/dashboard/konsumsi", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "kepala_uptd") {
          navigate("/dashboard/uptd", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "sekretaris") {
          navigate("/dashboard/sekretaris", { replace: true });
          setLoading(false);
          return;
        }
        if (roleParam === "super_admin") {
          navigate("/dashboard/superadmin", { replace: true });
          setLoading(false);
          return;
        }
      }

      // 4) Fallback eksplisit per role
      if (roleName === "super_admin") {
        navigate("/dashboard/superadmin", { replace: true });
        setLoading(false);
        return;
      }
      if (roleName === "sekretaris") {
        navigate("/dashboard/sekretaris", { replace: true });
        setLoading(false);
        return;
      }
      if (roleName === "gubernur" || roleName === "kepala_dinas") {
        navigate("/dashboard", { replace: true });
        setLoading(false);
        return;
      }

      if (roleName === "kepala_bidang") {
        if (unit.includes("ketersediaan")) {
          navigate("/dashboard/ketersediaan", { replace: true });
          setLoading(false);
          return;
        }
        if (unit.includes("distribusi")) {
          navigate("/dashboard/distribusi", { replace: true });
          setLoading(false);
          return;
        }
        if (unit.includes("konsumsi")) {
          navigate("/dashboard/konsumsi", { replace: true });
          setLoading(false);
          return;
        }
        navigate("/dashboard", { replace: true });
        setLoading(false);
        return;
      }

      if (roleName === "kepala_uptd") {
        navigate("/dashboard/uptd", { replace: true });
        setLoading(false);
        return;
      }

      navigate("/dashboard", { replace: true });
      setLoading(false);
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
              Portal:{" "}
              <span className="font-semibold text-blue-700">
                {PORTAL_LABELS[roleParam] || roleParam}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <p>{error}</p>
              {error.includes("tidak terdaftar untuk portal") && (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="mt-2 underline text-red-800 font-semibold hover:text-red-900"
                >
                  ← Kembali ke Halaman Utama
                </button>
              )}
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
              autoComplete="current-password"
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
