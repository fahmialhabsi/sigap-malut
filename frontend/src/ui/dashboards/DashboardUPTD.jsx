import React, { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { Navigate } from "react-router-dom";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import { roleIdToName } from "../../utils/roleMap";
import DashboardUPTDLayout from "../../layouts/DashboardUPTDLayout";
import uptdModules from "../../data/uptdModules";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";
import SkipToContent from "../../components/ui/SkipToContent";
import useKPIPolling from "../../hooks/useKPIPolling";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function HeroCard({ title, value, accent = "blue" }) {
  const gradients = {
    blue: "from-blue-900/80 to-blue-700/60",
    cyan: "from-cyan-900/80 to-cyan-700/60",
    amber: "from-amber-900/80 to-amber-700/60",
    red: "from-red-900/80 to-red-700/60",
  };

  return (
    <div
      className={`bg-gradient-to-t ${gradients[accent]} border-2 border-blue-700/40 rounded-2xl px-4 py-3 min-h-[86px] flex flex-col justify-between shadow-lg hover:scale-105 transition`}
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="text-4xl font-bold text-white tracking-tight">
        {value}
      </div>
      <div className="text-xs font-medium text-blue-200/90 uppercase tracking-wide">
        {title}
      </div>
    </div>
  );
}

function PanelBox({ title, children, customClass = "" }) {
  return (
    <div
      className={`bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 ${customClass} shadow-xl`}
      style={{ backdropFilter: "blur(17px)" }}
    >
      <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
        <span className="text-2xl">📦</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function DashboardUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const { kpi: liveKpi } = useKPIPolling("kasi-uptd");

  const [renjaUPTD, setRenjaUPTD] = useState([]);
  const [renjaLoading, setRenjaLoading] = useState(true);
  const [labData, setLabData] = useState([]);
  const [labLoading, setLabLoading] = useState(true);
  const [equipData, setEquipData] = useState([]);
  const [equipLoading, setEquipLoading] = useState(true);
  const [sopItems, setSopItems] = useState([]);
  const [sopLoading, setSopLoading] = useState(true);
  const [sopChecks, setSopChecks] = useState({});
  const [sopSaving, setSopSaving] = useState(false);
  const [cocData, setCocData] = useState([]);
  const [cocLoading, setCocLoading] = useState(true);

  React.useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "UPT-TKN",
        status: "akses",
        detail: "Akses modul layanan teknis UPTD",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setRenjaLoading(true);
    api
      .get("/api/epelara/renja", { params: { limit: 6 } })
      .then((res) => {
        const d = res.data;
        setRenjaUPTD(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => setRenjaUPTD([]))
      .finally(() => setRenjaLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLabLoading(true);
    api
      .get("/api/epelara/realisasi-indikator", { params: { limit: 10 } })
      .then((res) => {
        const d = res.data;
        setLabData(
          Array.isArray(d) ? d.slice(0, 10) : d?.data?.slice(0, 10) || [],
        );
      })
      .catch(() => setLabData([]))
      .finally(() => setLabLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setEquipLoading(true);
    api
      .get("/api/uptd-ops/equipment")
      .then((res) => {
        const d = res.data;
        setEquipData(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => setEquipData([]))
      .finally(() => setEquipLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSopLoading(true);
    api
      .get("/api/uptd-ops/sop-check")
      .then((res) => {
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : res.data?.data || [];
        setSopItems(items);
        const init = {};
        items.forEach((s) => {
          init[s.item] = s.is_compliant ?? false;
        });
        setSopChecks(init);
      })
      .catch(() => setSopItems([]))
      .finally(() => setSopLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setCocLoading(true);
    api
      .get("/api/uptd-ops/tracking", { params: { limit: 10 } })
      .then((res) => {
        const d = res.data;
        setCocData(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => setCocData([]))
      .finally(() => setCocLoading(false));
  }, [user]);

  const handleSopSave = async () => {
    if (!sopItems.length) return;
    setSopSaving(true);
    try {
      await api.post("/api/uptd-ops/sop-check/bulk", {
        checks: sopItems.map((s) => ({
          checklist_item: s.item,
          kategori: s.kategori,
          is_compliant: sopChecks[s.item] ?? false,
        })),
      });
    } catch (_) {}
    setSopSaving(false);
  };

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "kepala_uptd" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja.includes("uptd"));

  if (!isAllowed) return <Navigate to="/unauthorized" replace />;

  const moduleCards = [...uptdModules]
    .filter(
      (row) =>
        row?.is_active === undefined ||
        row?.is_active === null ||
        row?.is_active === true ||
        String(row?.is_active).toLowerCase() === "true" ||
        String(row?.is_active) === "1",
    )
    .sort((a, b) => {
      const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
      const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
      return orderA - orderB;
    });

  // State untuk panel broadcast
  const [broadcastPesan, setBroadcastPesan] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Handler kirim broadcast
  const handleBroadcast = async () => {
    if (!broadcastPesan.trim()) return;
    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const res = await api.post("/api/notifications/broadcast-uptd", {
        pesan: broadcastPesan.trim(),
      });
      const sent = res.data?.sent ?? 0;
      setBroadcastResult({
        ok: true,
        msg:
          sent > 0
            ? `✅ Notifikasi berhasil dikirim ke ${sent} pegawai UPTD.`
            : "⚠️ Tidak ada user UPTD terdaftar, notifikasi tidak terkirim.",
      });
      setBroadcastPesan("");
    } catch {
      setBroadcastResult({
        ok: false,
        msg: "❌ Gagal mengirim notifikasi. Coba lagi.",
      });
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <DashboardUPTDLayout modules={moduleCards}>
      <SkipToContent />
      <main
        id="main-content"
        aria-label="Konten Utama Dashboard UPTD"
        className="w-full px-6 md:px-12 py-8 space-y-8"
      >
        {/* Hero Section */}
        <header
          role="banner"
          aria-label="Header Dashboard UPTD"
          className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-8 shadow-2xl"
          style={{ backdropFilter: "blur(15px)" }}
        >
          <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label="UPTD">
              🏛️
            </span>
            Dashboard UPTD
          </h1>
          <p className="text-blue-200/80 text-base leading-relaxed">
            Ringkasan KPI dan modul UPTD Balai Pengawasan Mutu dan Keamanan
            Pangan
          </p>
          {liveKpi && (
            <p className="text-sm text-cyan-300 mt-2" aria-live="polite">
              Antrian Verifikasi:{" "}
              <strong>{liveKpi.antrianVerifikasi ?? "—"}</strong>
            </p>
          )}
        </header>

        {/* Panel Broadcast Kepala UPTD ke seluruh UPTD */}
        {roleName === "kepala_uptd" && (
          <div
            className="bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 shadow-xl mb-8"
            style={{ backdropFilter: "blur(17px)" }}
          >
            <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
              <span className="text-2xl">📢</span> Broadcast Perintah/Instruksi
              ke Seluruh UPTD
            </h2>
            <p className="text-blue-200/80 text-sm mb-3">
              Kirim perintah, instruksi, atau pengumuman ke seluruh Kasubag TU,
              Kasi Teknis, Kasi Mutu, Fungsional, dan Pelaksana di lingkungan
              UPTD. Notifikasi akan masuk ke dashboard masing-masing.
            </p>
            <textarea
              value={broadcastPesan}
              onChange={(e) => {
                setBroadcastPesan(e.target.value.slice(0, 500));
                setBroadcastResult(null);
              }}
              placeholder="Tuliskan perintah/instruksi ke seluruh UPTD (maks. 500 karakter)…"
              rows={3}
              className="w-full rounded-lg bg-slate-900/70 border border-slate-600/60 text-slate-100 placeholder:text-slate-500 text-sm p-3 resize-none focus:outline-none focus:border-amber-400 mb-2"
              maxLength={500}
            />
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-slate-500">
                {broadcastPesan.length}/500 karakter
              </span>
              <button
                disabled={
                  broadcastSending || broadcastPesan.trim().length === 0
                }
                onClick={handleBroadcast}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold transition"
              >
                {broadcastSending ? "Mengirim…" : "📤 Kirim Broadcast"}
              </button>
            </div>
            {broadcastResult && (
              <div
                className={`text-sm px-4 py-2 rounded-lg ${
                  broadcastResult.ok
                    ? "bg-emerald-900/40 border border-emerald-500/40 text-emerald-200"
                    : "bg-red-900/40 border border-red-500/40 text-red-200"
                }`}
              >
                {broadcastResult.msg}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-700/40">
              <p className="text-xs text-slate-400">
                Contoh penggunaan: Broadcast deadline, instruksi kerja,
                pengumuman penting, koordinasi lintas seksi.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <HeroCard title="Indikator Monitoring" value="59" accent="blue" />
          <HeroCard title="Compliance Alur" value="99%" accent="cyan" />
          <HeroCard title="Bypass Terdeteksi" value="0" accent="amber" />
          <HeroCard title="Data Valid" value="98%" accent="blue" />
        </div>

        <div className="mt-8">
          <BukaEPelaraButton
            label="Buka e-Pelara — UPTD"
            targetPath="/"
            className="w-full md:w-auto"
          />
        </div>

        {/* Panel Perencanaan UPTD — Bagian IV, Role 5 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/10 rounded-xl border border-blue-300/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-blue-100 text-base">
                📄 Renstra UPTD
              </h2>
              <BukaEPelaraButton
                label="Lihat/Edit →"
                targetPath="/dashboard-renstra"
                className="!py-1 !px-2 !text-xs"
              />
            </div>
            <p className="text-xs text-blue-200/80">
              Dokumen Renstra untuk unit UPTD (lab pengujian, sertifikasi).
              Submit ke Sekretaris sebelum ke Kepala Dinas.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl border border-cyan-300/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-cyan-100 text-base">
                💰 DPA UPTD
              </h2>
              <BukaEPelaraButton
                label="Lihat DPA →"
                targetPath="/dashboard-dpa"
                className="!py-1 !px-2 !text-xs"
              />
            </div>
            <p className="text-xs text-cyan-200/80">
              Anggaran UPTD yang sudah disahkan. Gunakan sebagai dasar realisasi
              dan pelaporan.
            </p>
          </div>
        </div>

        {/* ─── PANEL RENJA UPTD SPESIFIK — Bagian IV Priority 1 ─── */}
        <div className="mt-6 bg-white/10 rounded-xl border border-emerald-300/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-emerald-100 text-base flex items-center gap-2">
              📝 Renja UPTD — Input &amp; Status
            </h2>
            <div className="flex gap-2">
              <BukaEPelaraButton
                label="Input Renja →"
                targetPath="/dashboard-renja"
                className="!py-1 !px-2 !text-xs"
              />
              <BukaEPelaraButton
                label="Lihat Status"
                targetPath="/dashboard-renja?view=status"
                className="!py-1 !px-2 !text-xs !bg-white/10"
              />
            </div>
          </div>
          <p className="text-xs text-emerald-200/70 mb-4">
            Rencana Kerja Tahunan UPTD — dokumen ini harus diajukan ke
            Sekretariat sebelum batas waktu. Status:{" "}
            <strong className="text-white">
              Diajukan → Diverifikasi → Disetujui
            </strong>
            .
          </p>
          {renjaLoading ? (
            <p className="text-xs text-blue-300/70 animate-pulse">
              Memuat data Renja…
            </p>
          ) : renjaUPTD.length === 0 ? (
            <div className="bg-amber-900/30 border border-amber-400/30 rounded-lg p-3 text-xs text-amber-200">
              ⚠️ Belum ada dokumen Renja yang tersimpan untuk unit ini. Klik{" "}
              <strong>Input Renja</strong> untuk memulai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-emerald-300/80 uppercase">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Dokumen Renja</th>
                    <th className="px-2 py-1.5 text-left">Tahun</th>
                    <th className="px-2 py-1.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {renjaUPTD.map((renja, i) => {
                    const st = renja.status ?? "draft";
                    const badge =
                      st === "disetujui" || st === "approved"
                        ? "bg-green-500/30 text-green-200"
                        : st === "diverifikasi" || st === "verifikasi"
                          ? "bg-teal-500/30 text-teal-200"
                          : st === "diajukan"
                            ? "bg-amber-500/30 text-amber-200"
                            : st === "ditolak"
                              ? "bg-red-500/30 text-red-200"
                              : "bg-gray-500/30 text-gray-300";
                    return (
                      <tr
                        key={renja.id ?? i}
                        className="border-t border-white/5 hover:bg-white/5"
                      >
                        <td className="px-2 py-2 text-blue-100 max-w-[200px] truncate">
                          {renja.judul ??
                            renja.nama ??
                            renja.jenis_dokumen ??
                            `Renja #${i + 1}`}
                        </td>
                        <td className="px-2 py-2 text-blue-300/70">
                          {renja.tahun ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge}`}
                          >
                            {st}
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

        {/* ─── PANEL REALISASI HASIL LAB vs TARGET — Priority 2 ─── */}
        <div className="mt-6 bg-white/10 rounded-xl border border-violet-300/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-violet-100 text-base flex items-center gap-2">
              🔬 Realisasi Hasil Lab vs Target Indikator
            </h2>
            <BukaEPelaraButton
              label="Detail Monev →"
              targetPath="/dashboard-monev"
              className="!py-1 !px-2 !text-xs"
            />
          </div>
          {labLoading ? (
            <p className="text-xs text-violet-300/70 animate-pulse">
              Memuat data indikator lab…
            </p>
          ) : labData.length === 0 ? (
            <div className="bg-amber-900/30 border border-amber-400/30 rounded-lg p-3 text-xs text-amber-200">
              ⚠️ Belum ada data realisasi indikator untuk unit ini. Data berasal
              dari e-Pelara Monev.
            </div>
          ) : (
            <div className="space-y-3">
              {labData.map((row, i) => {
                const target = Number(row.target ?? row.target_nilai ?? 0);
                const realisasi = Number(
                  row.realisasi ??
                    row.realisasi_nilai ??
                    row.nilai_realisasi ??
                    0,
                );
                const pct =
                  target > 0
                    ? Math.min(Math.round((realisasi / target) * 100), 100)
                    : 0;
                const barColor =
                  pct >= 100
                    ? "bg-green-400"
                    : pct >= 80
                      ? "bg-teal-400"
                      : pct >= 50
                        ? "bg-amber-400"
                        : target > 0
                          ? "bg-red-400"
                          : "bg-gray-500";
                const label =
                  pct >= 100
                    ? "Tercapai"
                    : pct >= 80
                      ? "On Track"
                      : pct >= 50
                        ? "Perlu Perhatian"
                        : target > 0
                          ? "Kritis"
                          : "—";
                return (
                  <div key={row.id ?? i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-violet-100 font-medium truncate max-w-[280px]">
                        {row.nama_indikator ??
                          row.indikator ??
                          row.nama ??
                          `Indikator #${i + 1}`}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-violet-300/70">
                          {realisasi > 0
                            ? realisasi.toLocaleString("id-ID")
                            : "—"}
                          {" / "}
                          {target > 0 ? target.toLocaleString("id-ID") : "—"}
                          {row.satuan ? ` ${row.satuan}` : ""}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            pct >= 100
                              ? "bg-green-500/30 text-green-200"
                              : pct >= 80
                                ? "bg-teal-500/30 text-teal-200"
                                : pct >= 50
                                  ? "bg-amber-500/30 text-amber-200"
                                  : target > 0
                                    ? "bg-red-500/30 text-red-200"
                                    : "bg-gray-500/30 text-gray-400"
                          }`}
                        >
                          {target > 0 ? `${pct}%` : "—"}{" "}
                          {label !== "—" ? `· ${label}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${target > 0 ? pct : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel: Jadwal Pemeliharaan Alat Lab */}
        <div
          className="bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 shadow-xl"
          style={{ backdropFilter: "blur(17px)" }}
        >
          <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
            <span className="text-2xl">🔧</span> Jadwal Pemeliharaan Alat Lab
          </h2>
          {equipLoading ? (
            <p className="text-xs text-blue-300/70 animate-pulse">
              Memuat data peralatan…
            </p>
          ) : equipData.length === 0 ? (
            <p className="text-xs text-blue-300/60">
              Belum ada data jadwal pemeliharaan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-blue-100">
                <thead>
                  <tr className="border-b border-blue-700/40 text-blue-300 uppercase text-[10px]">
                    <th className="text-left py-2 pr-3">Nama Alat</th>
                    <th className="text-left py-2 pr-3">Jad. Berikutnya</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody>
                  {equipData.map((eq, i) => {
                    const next = eq.tanggal_berikutnya
                      ? new Date(eq.tanggal_berikutnya)
                      : null;
                    const now = new Date();
                    const isOverdue = next && next < now;
                    const isDueSoon =
                      next && !isOverdue && next - now < 7 * 24 * 3600 * 1000;
                    const rowColor = isOverdue
                      ? "text-red-300"
                      : isDueSoon
                        ? "text-amber-300"
                        : "text-green-300";
                    const badge =
                      eq.status === "selesai"
                        ? "bg-green-500/30 text-green-200"
                        : eq.status === "terlambat" || isOverdue
                          ? "bg-red-500/30 text-red-200"
                          : "bg-blue-500/30 text-blue-200";
                    return (
                      <tr
                        key={eq.id ?? i}
                        className="border-b border-blue-800/30"
                      >
                        <td className="py-2 pr-3 font-medium">
                          {eq.nama_alat}
                        </td>
                        <td className={`py-2 pr-3 ${rowColor}`}>
                          {next ? next.toLocaleDateString("id-ID") : "—"}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge}`}
                          >
                            {isOverdue ? "Terlambat" : eq.status || "Terjadwal"}
                          </span>
                        </td>
                        <td className="py-2">{eq.penanggung_jawab || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel: SOP Compliance Check */}
        <div
          className="bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 shadow-xl"
          style={{ backdropFilter: "blur(17px)" }}
        >
          <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
            <span className="text-2xl">✅</span> SOP Compliance Check
          </h2>
          {sopLoading ? (
            <p className="text-xs text-blue-300/70 animate-pulse">
              Memuat checklist SOP…
            </p>
          ) : (
            <div className="space-y-2">
              {sopItems.map((s, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!sopChecks[s.item]}
                    onChange={(e) =>
                      setSopChecks((prev) => ({
                        ...prev,
                        [s.item]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-teal-400"
                  />
                  <span className="text-xs text-blue-100 flex-1">{s.item}</span>
                  <span className="text-[10px] text-blue-400/60">
                    {s.kategori}
                  </span>
                </label>
              ))}
              <button
                onClick={handleSopSave}
                disabled={sopSaving || sopItems.length === 0}
                className="mt-4 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold transition"
              >
                {sopSaving ? "Menyimpan…" : "Simpan Hasil Check"}
              </button>
            </div>
          )}
        </div>

        {/* Panel: Chain of Custody Sampel */}
        <div
          className="bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 shadow-xl"
          style={{ backdropFilter: "blur(17px)" }}
        >
          <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
            <span className="text-2xl">📦</span> Chain of Custody Sampel
          </h2>
          {cocLoading ? (
            <p className="text-xs text-blue-300/70 animate-pulse">
              Memuat data sampel…
            </p>
          ) : cocData.length === 0 ? (
            <p className="text-xs text-blue-300/60">
              Belum ada log pelacakan sampel.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-blue-100">
                <thead>
                  <tr className="border-b border-blue-700/40 text-blue-300 uppercase text-[10px]">
                    <th className="text-left py-2 pr-3">No. Sampel</th>
                    <th className="text-left py-2 pr-3">Komoditas</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {cocData.map((row, i) => {
                    const statusColor =
                      row.status === "selesai"
                        ? "bg-green-500/30 text-green-200"
                        : row.status === "dikembalikan"
                          ? "bg-red-500/30 text-red-200"
                          : row.status === "dalam_proses"
                            ? "bg-amber-500/30 text-amber-200"
                            : "bg-blue-500/30 text-blue-200";
                    return (
                      <tr
                        key={row.id ?? i}
                        className="border-b border-blue-800/30"
                      >
                        <td className="py-2 pr-3 font-mono">
                          {row.nomor_sampel}
                        </td>
                        <td className="py-2 pr-3">
                          {row.nama_komoditas || "—"}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 text-blue-300/70">
                          {row.timestamp_event
                            ? new Date(row.timestamp_event).toLocaleString(
                                "id-ID",
                              )
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </DashboardUPTDLayout>
  );
}
