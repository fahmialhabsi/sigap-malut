import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import api from "../../utils/api";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function KpiCard({ label, value, sub, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  };
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${colors[color] || colors.blue}`}
    >
      <div className="text-3xl font-bold">{value ?? "—"}</div>
      <div className="font-semibold text-sm">{label}</div>
      {sub && <div className="text-xs opacity-70">{sub}</div>}
    </div>
  );
}

export default function DashboardKepalaDinas() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ePelaraMonev, setEPelaraMonev] = useState([]);
  const [ePelaraLoading, setEPelaraLoading] = useState(true);
  const [visiMisi, setVisiMisi] = useState(null);
  const [renstraPending, setRenstraPending] = useState([]);
  const [prioritasGubernur, setPrioritasGubernur] = useState([]);
  const [dpaData, setDpaData] = useState([]);
  const [renstraAll, setRenstraAll] = useState([]);
  const [realisasiData, setRealisasiData] = useState([]);
  const [approveLoading, setApproveLoading] = useState({});
  const [lakipData, setLakipData] = useState([]);
  const [lakipLoading, setLakipLoading] = useState(true);

  // Akses hanya untuk kepala_dinas dan super_admin
  const allowed = ["kepala_dinas", "super_admin"];
  const isAllowed = !!(user && allowed.includes(roleName));

  useEffect(() => {
    if (!isAllowed) return;
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          sumRes,
          taskRes,
          monevRes,
          visiRes,
          renstraRes,
          prioritasRes,
          dpaRes,
          renstraAllRes,
          realisasiRes,
          lakipRes,
        ] = await Promise.allSettled([
          api.get("/api/dashboard/sekretaris/summary"),
          api.get("/api/tasks?limit=5&sort=deadline&order=asc"),
          api.get("/api/epelara/monev", { params: { limit: 5 } }),
          api.get("/api/epelara/visi-misi"),
          api.get("/api/epelara/renstra-opd", {
            params: { status: "diajukan", limit: 10 },
          }),
          api.get("/api/epelara/prioritas-gubernur"),
          api.get("/api/epelara/dpa", { params: { limit: 10 } }),
          api.get("/api/epelara/renstra-opd", { params: { limit: 50 } }),
          api.get("/api/epelara/realisasi-indikator", { params: { limit: 8 } }),
          api.get("/api/epelara/lakip", { params: { limit: 5 } }),
        ]);
        if (mounted) {
          if (sumRes.status === "fulfilled") {
            setSummary(sumRes.value.data?.data || sumRes.value.data);
          }
          if (taskRes.status === "fulfilled") {
            const data = taskRes.value.data;
            setTasks(
              Array.isArray(data)
                ? data.slice(0, 5)
                : data?.data?.slice(0, 5) || [],
            );
          }
          if (monevRes.status === "fulfilled") {
            const mData = monevRes.value.data;
            setEPelaraMonev(
              Array.isArray(mData)
                ? mData.slice(0, 5)
                : mData?.data?.slice(0, 5) || [],
            );
          }
          if (visiRes.status === "fulfilled") {
            const vData = visiRes.value.data;
            setVisiMisi(vData?.data ?? vData ?? null);
          }
          if (renstraRes.status === "fulfilled") {
            const rData = renstraRes.value.data;
            setRenstraPending(Array.isArray(rData) ? rData : rData?.data || []);
          }
          if (prioritasRes.status === "fulfilled") {
            const pData = prioritasRes.value.data;
            setPrioritasGubernur(
              Array.isArray(pData)
                ? pData.slice(0, 5)
                : pData?.data?.slice(0, 5) || [],
            );
          }
          if (dpaRes.status === "fulfilled") {
            const dData = dpaRes.value.data;
            setDpaData(
              Array.isArray(dData)
                ? dData.slice(0, 8)
                : dData?.data?.slice(0, 8) || [],
            );
          }
          if (renstraAllRes.status === "fulfilled") {
            const raData = renstraAllRes.value.data;
            setRenstraAll(Array.isArray(raData) ? raData : raData?.data || []);
          }
          if (realisasiRes.status === "fulfilled") {
            const riData = realisasiRes.value.data;
            setRealisasiData(
              Array.isArray(riData)
                ? riData.slice(0, 8)
                : riData?.data?.slice(0, 8) || [],
            );
          }
          if (lakipRes.status === "fulfilled") {
            const lData = lakipRes.value.data;
            setLakipData(
              Array.isArray(lData)
                ? lData.slice(0, 5)
                : lData?.data?.slice(0, 5) || [],
            );
          }
          setEPelaraLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, [isAllowed]);

  const totalTugas = summary?.totalTasks ?? summary?.total_tugas ?? "—";
  const selesai = summary?.completedTasks ?? summary?.selesai ?? "—";
  const terlambat = summary?.overdueTasks ?? summary?.overdue ?? "—";
  const completionRate =
    summary?.completionRate != null ? `${summary.completionRate}%` : "—";

  // Hitung % Status Dokumen Renstra per bidang dari renstraAll
  const BIDANG_KEYS = [
    { label: "Ketersediaan", kw: "ketersediaan" },
    { label: "Distribusi", kw: "distribusi" },
    { label: "Konsumsi", kw: "konsumsi" },
    { label: "UPTD", kw: "uptd" },
  ];
  const statusDocPerBidang = BIDANG_KEYS.map(({ label, kw }) => {
    const subset = renstraAll.filter((r) => {
      const unit = String(
        r.unit_kerja ?? r.opd ?? r.bidang ?? "",
      ).toLowerCase();
      return unit.includes(kw);
    });
    const approved = subset.filter(
      (r) => r.status === "disetujui" || r.status === "approved",
    ).length;
    const total = subset.length;
    const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { label, approved, total, pct };
  });

  const handleApprove = async (id, action) => {
    setApproveLoading((prev) => ({ ...prev, [id]: action }));
    try {
      await api.patch(`/api/epelara/renstra-opd/${id}/approve`, {
        status: action,
      });
      setRenstraPending((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // gagal tidak crash — item masih tampil di antrian
    } finally {
      setApproveLoading((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  };

  if (!isAllowed) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Dashboard ini hanya untuk Kepala Dinas.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Kepala Dinas
        </h1>
        <p className="text-gray-500 mt-1">
          Executive Summary — Dinas Ketahanan Pangan Provinsi Maluku Utara
        </p>
      </div>

      {/* KPI Hero Tiles */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">
          Memuat data KPI...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <KpiCard
            label="Total Tugas Aktif"
            value={totalTugas}
            sub="Semua bidang"
            color="blue"
          />
          <KpiCard
            label="Tugas Selesai"
            value={selesai}
            sub="Tepat waktu"
            color="green"
          />
          <KpiCard
            label="Tugas Terlambat"
            value={terlambat}
            sub="Melewati deadline"
            color="red"
          />
          <KpiCard
            label="Tingkat Penyelesaian"
            value={completionRate}
            sub="Selesai / Total"
            color="indigo"
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval & SLA Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Persetujuan Pending</h2>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer hover:bg-amber-100 transition"
              onClick={() => navigate("/approval-workflow")}
            >
              <div>
                <div className="font-semibold text-amber-800 text-sm">
                  Approval Workflow
                </div>
                <div className="text-xs text-amber-600">
                  Lihat semua persetujuan
                </div>
              </div>
              <span className="text-amber-600">→</span>
            </div>
            <div
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition"
              onClick={() => navigate("/surat/masuk")}
            >
              <div>
                <div className="font-semibold text-blue-800 text-sm">
                  Surat Masuk
                </div>
                <div className="text-xs text-blue-600">
                  Lihat disposisi surat
                </div>
              </div>
              <span className="text-blue-600">→</span>
            </div>
            <div
              className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg cursor-pointer hover:bg-indigo-100 transition"
              onClick={() => navigate("/pelaporan")}
            >
              <div>
                <div className="font-semibold text-indigo-800 text-sm">
                  Laporan Bulanan
                </div>
                <div className="text-xs text-indigo-600">
                  Ringkasan laporan bidang
                </div>
              </div>
              <span className="text-indigo-600">→</span>
            </div>
          </div>
        </div>

        {/* Tugas Mendekati Deadline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">
            Tugas Mendekati Deadline
          </h2>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">✅</div>
              <p>Tidak ada tugas mendesak</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const isOverdue =
                  task.deadline && new Date(task.deadline) < new Date();
                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {task.title || task.judul}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {task.assignee_name || task.assigned_to || "—"} ·
                        Deadline:{" "}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString("id-ID")
                          : "—"}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isOverdue
                          ? "bg-red-100 text-red-700"
                          : task.status === "done" || task.status === "selesai"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isOverdue ? "Terlambat" : task.status || "Aktif"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => navigate("/modul/sekretariat-tasks")}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Lihat semua tugas →
          </button>
        </div>
      </div>

      {/* Navigasi Modul Strategis */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">Akses Modul Strategis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            {
              label: "Ketersediaan",
              path: "/dashboard/ketersediaan",
              icon: "🌾",
            },
            { label: "Distribusi", path: "/dashboard/distribusi", icon: "🚚" },
            { label: "Konsumsi", path: "/dashboard/konsumsi", icon: "🍽️" },
            {
              label: "Sekretariat",
              path: "/dashboard/sekretariat",
              icon: "📋",
            },
            { label: "Audit Trail", path: "/audit-trail", icon: "🔍" },
          ].map((m) => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl transition"
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-medium text-gray-700">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── PANEL PERENCANAAN: Visi & Misi ─── */}
      {visiMisi && (
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
          <h2 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
            🏛️ Visi &amp; Misi Pembangunan
          </h2>
          <p className="text-indigo-900 font-semibold text-sm mb-1">
            {visiMisi?.visi || visiMisi?.[0]?.visi || "—"}
          </p>
          {(visiMisi?.misi || visiMisi?.[0]?.misi) && (
            <p className="text-indigo-700 text-xs">
              {visiMisi?.misi || visiMisi?.[0]?.misi}
            </p>
          )}
        </div>
      )}

      {/* ─── PANEL PERENCANAAN: Status Dokumen Aktif % ─── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">
          📈 Status Dokumen Renstra Aktif per Bidang
        </h2>
        {ePelaraLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {statusDocPerBidang.map(({ label, approved, total, pct }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">
                    {label}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      pct >= 80
                        ? "text-green-600"
                        : pct >= 40
                          ? "text-amber-600"
                          : total > 0
                            ? "text-red-600"
                            : "text-gray-400"
                    }`}
                  >
                    {total > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 80
                        ? "bg-green-500"
                        : pct >= 40
                          ? "bg-amber-400"
                          : total > 0
                            ? "bg-red-400"
                            : "bg-gray-300"
                    }`}
                    style={{ width: `${total > 0 ? pct : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {total > 0
                    ? `${approved} disetujui / ${total} dokumen`
                    : "Belum ada data"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PANEL PERENCANAAN: Approval Queue + Prioritas Gubernur ─── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Queue Perencanaan */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              ⚡ Antrian Approval Perencanaan
              {renstraPending.length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {renstraPending.length}
                </span>
              )}
            </h2>
            <BukaEPelaraButton
              label="Buka Antrian →"
              targetPath="/dashboard-renstra"
              className="!py-1.5 !px-3 !text-xs"
            />
          </div>
          {ePelaraLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
          ) : renstraPending.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              ✅ Tidak ada dokumen perencanaan yang menunggu persetujuan.
            </p>
          ) : (
            <div className="space-y-2">
              {renstraPending.map((item, i) => {
                const isLoadingApprove =
                  approveLoading[item.id] === "disetujui";
                const isLoadingTolak = approveLoading[item.id] === "ditolak";
                const isAnyLoading = !!approveLoading[item.id];
                return (
                  <div
                    key={item.id ?? i}
                    className="flex flex-col gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">
                          {item.judul ||
                            item.jenis_dokumen ||
                            `Dokumen #${i + 1}`}
                        </p>
                        <p className="text-xs text-amber-700">
                          {item.unit_kerja || item.opd || "—"} ·{" "}
                          {item.tahun || "—"}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {item.status || "diajukan"}
                      </span>
                    </div>
                    {item.id && (
                      <div className="flex gap-2 pt-1">
                        <button
                          disabled={isAnyLoading}
                          onClick={() => handleApprove(item.id, "disetujui")}
                          className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold transition"
                        >
                          {isLoadingApprove ? "Memproses…" : "✅ Setujui"}
                        </button>
                        <button
                          disabled={isAnyLoading}
                          onClick={() => handleApprove(item.id, "ditolak")}
                          className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold transition"
                        >
                          {isLoadingTolak ? "Memproses…" : "❌ Tolak"}
                        </button>
                        <button
                          disabled={isAnyLoading}
                          onClick={() => handleApprove(item.id, "direvisi")}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-semibold transition"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Program Prioritas Gubernur */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Program Prioritas Gubernur
          </h2>
          {ePelaraLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
          ) : prioritasGubernur.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Data prioritas belum tersedia.
            </p>
          ) : (
            <ul className="space-y-2">
              {prioritasGubernur.map((p, i) => (
                <li key={p.id ?? i} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.nama_prioritas || p.prioritas || p.nama || "—"}
                    </p>
                    {p.keterangan && (
                      <p className="text-xs text-gray-500">{p.keterangan}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ─── PANEL PERENCANAAN: Realisasi DPA per Bidang ─── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">
            📊 Realisasi DPA per Bidang
          </h2>
          <BukaEPelaraButton
            label="Lihat DPA Lengkap →"
            targetPath="/dashboard-dpa"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {ePelaraLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data DPA…
          </p>
        ) : dpaData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Data DPA belum tersedia.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">
                    Program / Sub-Kegiatan
                  </th>
                  <th className="px-3 py-2 text-left">Unit / Bidang</th>
                  <th className="px-3 py-2 text-right">Pagu (Rp)</th>
                  <th className="px-3 py-2 text-right">Realisasi</th>
                  <th className="px-3 py-2 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {dpaData.map((row, i) => {
                  const pagu = Number(
                    row.pagu_anggaran ?? row.anggaranTotal ?? 0,
                  );
                  const realisasi = Number(
                    row.realisasi_anggaran ?? row.realisasi ?? 0,
                  );
                  const pct =
                    pagu > 0 ? Math.round((realisasi / pagu) * 100) : 0;
                  return (
                    <tr
                      key={row.id ?? i}
                      className="border-t border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[220px] truncate">
                        {row.nama_program ??
                          row.program ??
                          row.nama_kegiatan ??
                          row.nama ??
                          `DPA #${i + 1}`}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {row.unit_kerja ?? row.bidang ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {pagu > 0 ? pagu.toLocaleString("id-ID") : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {realisasi > 0
                          ? realisasi.toLocaleString("id-ID")
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            pct >= 80
                              ? "bg-green-100 text-green-700"
                              : pct >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {pagu > 0 ? `${pct}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">Akses e-Pelara</h2>
        <BukaEPelaraButton
          label="Buka e-Pelara — Perencanaan & Dokumen"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>

      {/* ─── PANEL PERENCANAAN: KPI Alignment Renstra vs Realisasi ─── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-teal-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">
            🔬 KPI Alignment — Renstra vs Realisasi
          </h2>
          <BukaEPelaraButton
            label="Detail Monev →"
            targetPath="/dashboard-monev"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {ePelaraLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data indikator…
          </p>
        ) : realisasiData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Data realisasi indikator belum tersedia.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-teal-50 text-teal-700 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Indikator</th>
                  <th className="px-3 py-2 text-right">Target</th>
                  <th className="px-3 py-2 text-right">Realisasi</th>
                  <th className="px-3 py-2 text-center">Capaian</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {realisasiData.map((row, i) => {
                  const target = Number(row.target ?? row.target_nilai ?? 0);
                  const realisasi = Number(
                    row.realisasi ??
                      row.realisasi_nilai ??
                      row.nilai_realisasi ??
                      0,
                  );
                  const pct =
                    target > 0 ? Math.round((realisasi / target) * 100) : 0;
                  return (
                    <tr
                      key={row.id ?? i}
                      className="border-t border-gray-50 hover:bg-teal-50/30"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[240px] truncate">
                        {row.nama_indikator ??
                          row.indikator ??
                          row.nama ??
                          `Indikator #${i + 1}`}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {target > 0 ? target.toLocaleString("id-ID") : "—"}
                        {row.satuan ? ` ${row.satuan}` : ""}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {realisasi > 0
                          ? realisasi.toLocaleString("id-ID")
                          : "—"}
                        {row.satuan ? ` ${row.satuan}` : ""}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {target > 0 ? `${pct}%` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            pct >= 100
                              ? "bg-green-100 text-green-700"
                              : pct >= 80
                                ? "bg-teal-100 text-teal-700"
                                : pct >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {pct >= 100
                            ? "Tercapai"
                            : pct >= 80
                              ? "On Track"
                              : pct >= 50
                                ? "Perlu Perhatian"
                                : target > 0
                                  ? "Kritis"
                                  : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── PANEL LAKIP READ-ONLY — Priority 2 ─── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📑 LAKIP — Laporan Akuntabilitas Kinerja (Read-Only)
          </h2>
          <BukaEPelaraButton
            label="Unduh LAKIP →"
            targetPath="/dashboard-lakip"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {ePelaraLoading || lakipLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat LAKIP…</p>
        ) : lakipData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            LAKIP belum tersedia. Data akan muncul setelah Monev dan Renstra
            selesai dikompilasi.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Program / Kegiatan</th>
                  <th className="px-3 py-2 text-left">Periode</th>
                  <th className="px-3 py-2 text-right">% Capaian</th>
                  <th className="px-3 py-2 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {lakipData.map((row, i) => {
                  const capaian = Number(
                    row.capaian_kinerja ?? row.capaian ?? row.persentase ?? 0,
                  );
                  const predikat =
                    capaian >= 100
                      ? {
                          label: "Sangat Baik",
                          cls: "bg-green-100 text-green-700",
                        }
                      : capaian >= 85
                        ? { label: "Baik", cls: "bg-teal-100 text-teal-700" }
                        : capaian >= 70
                          ? {
                              label: "Cukup",
                              cls: "bg-amber-100 text-amber-700",
                            }
                          : { label: "Kurang", cls: "bg-red-100 text-red-700" };
                  return (
                    <tr
                      key={row.id ?? i}
                      className="border-t border-gray-50 hover:bg-emerald-50/30"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[280px] truncate">
                        {row.nama_program ??
                          row.program ??
                          row.kegiatan ??
                          row.nama ??
                          `Item #${i + 1}`}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {row.tahun ?? row.periode ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-700">
                        {capaian > 0 ? `${capaian}%` : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${predikat.cls}`}
                        >
                          {capaian > 0 ? predikat.label : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          ⓘ Data LAKIP bersifat read-only. Perubahan dilakukan melalui Sistem
          Monev e-Pelara.
        </p>
      </div>

      {/* A-12: Antrian Persetujuan e-Pelara */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-indigo-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">
            Antrian Persetujuan e-Pelara
          </h2>
          <BukaEPelaraButton
            label="Buka Antrian →"
            targetPath="/monev"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {ePelaraLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data e-Pelara…
          </p>
        ) : ePelaraMonev.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Tidak ada item menunggu persetujuan di e-Pelara.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-600 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Program / Kegiatan</th>
                  <th className="px-3 py-2 text-left">Periode</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {ePelaraMonev.map((item, i) => (
                  <tr
                    key={item.id ?? i}
                    className="border-t border-gray-50 hover:bg-indigo-50/40"
                  >
                    <td className="px-3 py-2 font-medium text-gray-800 max-w-[260px] truncate">
                      {item.program ||
                        item.kegiatan ||
                        item.nama ||
                        `Item #${i + 1}`}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {item.tahun || item.periode || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "approved" ||
                          item.status === "disetujui"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "rejected" ||
                                item.status === "ditolak"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status || "menunggu"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
