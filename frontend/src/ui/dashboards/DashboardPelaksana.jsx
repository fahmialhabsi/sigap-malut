// frontend/src/ui/dashboards/DashboardPelaksana.jsx
// A-10: Dashboard Staf Pelaksana
// config/roles.json: staf_pelaksana → create_draft, update_task_progress, upload_evidence, submit_done, view_assigned
// e-Pelara role (D-10): pelaksana → DRAFTER (create & update draft dokumen)
// P13 + P16: Pelaksana — modul data lapangan adaptif per unit_kerja
import React, { useEffect, useState } from "react";
import FormInputHargaPasar from "../../components/pelaksana/FormInputHargaPasar";
import ProgressCoverageHariIniStrip from "../../components/pelaksana/ProgressCoverageHariIniStrip";

// ─── Inline component: Modul Input Data Pangan (Pelaksana Bidang Teknis) ───
function ModulInputDataPangan({ unitKerja }) {
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    komoditas: "",
    stok_kg: "",
    harga_satuan: "",
    lokasi: "",
    keterangan: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    setHistoryLoading(true);
    import("../../utils/api").then(({ default: api }) => {
      api
        .get("/api/pelaksana/data-pangan/riwayat", { params: { limit: 5 } })
        .then((res) => setHistory(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.komoditas.trim() || !form.stok_kg) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { default: api } = await import("../../utils/api");
      const res = await api.post("/api/pelaksana/data-pangan", form);
      setResult({ ok: true });
      setHistory((prev) => [res.data?.data ?? { ...form, id: Date.now() }, ...prev.slice(0, 4)]);
      setForm((f) => ({ ...f, komoditas: "", stok_kg: "", harga_satuan: "", lokasi: "", keterangan: "" }));
    } catch {
      setResult({ ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const KOMODITAS_LIST = ["Beras", "Jagung", "Kedelai", "Minyak Goreng", "Gula Pasir", "Terigu", "Cabai Merah", "Bawang Merah", "Daging Sapi", "Daging Ayam"];

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          🌾 Input Data Pangan Harian
        </h2>
        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {unitKerja || "Bidang Teknis"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Data stok dan harga pangan yang Anda input akan digunakan JF sebagai bahan analisis ketersediaan dan distribusi.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Tanggal <span className="text-red-400">*</span></label>
            <input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Komoditas <span className="text-red-400">*</span></label>
            <select
              required
              value={form.komoditas}
              onChange={(e) => setForm((f) => ({ ...f, komoditas: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Pilih komoditas…</option>
              {KOMODITAS_LIST.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Stok (kg) <span className="text-red-400">*</span></label>
            <input
              type="number"
              required
              min={0}
              value={form.stok_kg}
              onChange={(e) => setForm((f) => ({ ...f, stok_kg: e.target.value }))}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Harga Satuan (Rp/kg)</label>
            <input
              type="number"
              min={0}
              value={form.harga_satuan}
              onChange={(e) => setForm((f) => ({ ...f, harga_satuan: e.target.value }))}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Lokasi/Pasar</label>
            <input
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
              placeholder="Pasar Bahari, Ternate…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Keterangan</label>
            <input
              value={form.keterangan}
              onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
              placeholder="Kondisi stok, catatan khusus…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting || !form.komoditas || !form.stok_kg}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
          >
            {submitting ? "Menyimpan…" : "📤 Kirim Data Pangan"}
          </button>
          {result && (
            <span className={`text-xs ${result.ok ? "text-green-600" : "text-red-500"}`}>
              {result.ok ? "✅ Data berhasil dikirim ke JF." : "❌ Gagal menyimpan. Coba lagi."}
            </span>
          )}
        </div>
      </form>
      {/* Riwayat input */}
      {(historyLoading || history.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Riwayat Input Terbaru</p>
          {historyLoading ? (
            <p className="text-xs text-gray-400 animate-pulse">Memuat riwayat…</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item, i) => (
                <div key={item.id ?? i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                  <span className="text-gray-700 font-medium">{item.komoditas ?? "—"}</span>
                  <span className="text-gray-500">{item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "—"}</span>
                  <span className="text-blue-600 font-medium">{item.stok_kg ? `${Number(item.stok_kg).toLocaleString("id-ID")} kg` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

const ALLOWED = ["pelaksana", "staf_pelaksana", "super_admin", "kepala_dinas"];

const PROGRESS_COLOR = {
  pending: "bg-gray-200",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
  terlambat: "bg-red-500",
};

export default function DashboardPelaksana() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unitKerja = user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
  // Modul Data Pangan tersedia untuk semua Pelaksana KECUALI sekretariat
  const showDataPangan = unitKerja !== "sekretariat" && !unitKerja.includes("sekretariat");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "PLK-001",
        status: "akses",
        detail: "Akses dashboard Pelaksana",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/tasks/assigned", { params: { limit: 15 } })
      .then((res) =>
        setTasks(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [],
        ),
      )
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter(
    (t) => !t.status || t.status === "pending",
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">⚙️</span>
          Dashboard Pelaksana
        </h1>
        <p className="text-blue-200/80 text-sm">
          Selamat datang,{" "}
          <span className="font-semibold text-white">
            {user?.nama_lengkap || user?.name || "—"}
          </span>{" "}
          · Unit: {user?.unit_kerja || "—"}
        </p>
        {isDistribusi && <ProgressCoverageHariIniStrip />}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tugas",
            value: loading ? "…" : tasks.length,
            color: "blue",
          },
          {
            label: "Sedang Dikerjakan",
            value: loading ? "…" : inProgress,
            color: "amber",
          },
          { label: "Selesai", value: loading ? "…" : done, color: "emerald" },
          { label: "Menunggu", value: loading ? "…" : pending, color: "gray" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
          >
            <div className={`text-3xl font-bold text-${kpi.color}-700`}>
              {kpi.value}
            </div>
            <div className={`text-xs font-medium text-${kpi.color}-600`}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progres Bar Keseluruhan */}
      {!loading && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">
            📈 Progress Keseluruhan
          </h2>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((done / tasks.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {done} dari {tasks.length} tugas selesai (
            {Math.round((done / tasks.length) * 100)}%)
          </p>
        </div>
      )}

      {/* Daftar Tugas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📋 Tugas Saya</h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas yang ditugaskan.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div
                key={t.id ?? i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {t.judul || t.title || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.modul_id || t.modulId || ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${PROGRESS_COLOR[t.status] ?? "bg-gray-300"}`}
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {t.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modul data lapangan — Ketersediaan vs Distribusi */}
      {showDataPangan && !isDistribusi && (
        <ModulInputDataPangan unitKerja={user?.unit_kerja} />
      )}
      {showDataPangan && isDistribusi && <FormInputHargaPasar />}

      {/* Target Kegiatan Saya (read-only) — Bagian IV, Role 6 */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎯 Target Sub-Kegiatan Saya (Read-Only)
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Daftar target sub-kegiatan unit kerja Anda. Kontribusi Anda terhadap
          perencanaan adalah melalui <strong>data operasional</strong> yang Anda
          input (stok, distribusi, lapangan) — data ini digunakan JF untuk
          menyusun Renstra berbasis data. Anda <strong>tidak</strong> mengakses
          form Renstra/Renja langsung.
        </p>
        <div className="flex flex-wrap gap-2">
          <BukaEPelaraButton
            label="Lihat Target (read-only) →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
          <BukaEPelaraButton
            label="Input Data Teknis Lapangan"
            targetPath="/input-laporan"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>DRAFTER</strong> — Anda dapat membuat dan mengupdate
          draft dokumen perencanaan.
        </p>
        <BukaEPelaraButton
          label="Buka e-Pelara"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
