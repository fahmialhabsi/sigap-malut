import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import DashboardDistribusiLayout from "../../layouts/DashboardDistribusiLayout";
import distribusiModules from "../../data/distribusiModules";
import { roleIdToName } from "../../utils/roleMap";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import DpaBidangWidget from "../../components/DpaBidangWidget";
import RenstraBidangWidget from "../../components/RenstraBidangWidget";
import api from "../../utils/api";
import BroadcastBidangPanel from "../../components/dashboard/BroadcastBidangPanel";
import SkipToContent from "../../components/ui/SkipToContent";
import useRoleGuard from "../../hooks/useRoleGuard";
import useKPIPolling from "../../hooks/useKPIPolling";

const ALLOWED_ROLES = [
  "kepala_bidang_distribusi", "kepala_bidang", "super_admin",
  "kepala_dinas", "gubernur", "fungsional_distribusi",
];

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardDistribusi() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const { allowed: guardAllowed, redirect } = useRoleGuard(ALLOWED_ROLES);
  const { kpi: liveKpi } = useKPIPolling("distribusi");

  // local fallback modules loaded from master-data
  const _distribusiModules = distribusiModules;

  const [subKegForm, setSubKegForm] = useState({
    nama: "",
    sasaran: "",
    indikator: "",
    pagu: "",
    keterangan: "",
  });
  const [subKegSubmitting, setSubKegSubmitting] = useState(false);
  const [subKegResult, setSubKegResult] = useState(null);
  const [subKegList, setSubKegList] = useState([]);
  const [subKegListLoading, setSubKegListLoading] = useState(false);

  useEffect(() => {
    if (user && roleName === "kepala_bidang_distribusi") {
      workflowStatusUpdateAPI({
        user,
        modulId: "D001",
        status: "akses",
        detail: "Akses modul Data pasar",
      });
    }
  }, [user, roleName]);

  useEffect(() => {
    if (!user) return;
    setSubKegListLoading(true);
    api
      .get("/api/sub-kegiatan-usul", { params: { bidang: "distribusi" } })
      .then((res) =>
        setSubKegList(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setSubKegList([]))
      .finally(() => setSubKegListLoading(false));
  }, [user]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "kepala_bidang_distribusi" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja === "bidang distribusi");

  if (!isAllowed && !guardAllowed) return <Navigate to={redirect || "/"} replace />;

  return (
    <DashboardDistribusiLayout fallbackModules={_distribusiModules}>
      <SkipToContent />
      {liveKpi && (
        <section aria-label="Status Distribusi Live" aria-live="polite"
          className="mx-6 mt-4 p-3 rounded-xl bg-blue-900/30 border border-blue-700/40 flex flex-wrap gap-6 text-sm">
          <span className="text-blue-200">Realisasi: <strong className="text-white">{liveKpi.totalRealisasi ?? "—"}</strong></span>
          <span className="text-blue-200">Target: <strong className="text-white">{liveKpi.persenTarget ?? "—"}%</strong></span>
          <span className="text-blue-200">Kecamatan Terlayani: <strong className="text-white">{liveKpi.kecamatanTerlayani ?? "—"}/{liveKpi.totalKecamatan ?? "—"}</strong></span>
        </section>
      )}
      <main id="main-content" aria-label="Konten Utama Dashboard Distribusi">
      {/* Panel Perintah/Broadcast untuk Kepala Bidang Distribusi */}
      <div className="mt-8 px-6 md:px-12 pb-4">
        <BroadcastBidangPanel
          label="Perintah/Broadcast ke Fungsional & Pelaksana Distribusi"
          tujuanOptions={[
            { value: "fungsional_distribusi", label: "Fungsional Distribusi" },
            { value: "pelaksana_distribusi", label: "Pelaksana Distribusi" },
          ]}
          endpoint="/notifications/broadcast-bidang-distribusi"
        />
      </div>
      {/* Konten dashboard distribusi dirender oleh layout */}
      {/* Jika ingin panel tambahan, tambahkan di sini */}
      <div className="mt-8 px-6 md:px-12 pb-4">
        <BukaEPelaraButton
          label="Buka e-Pelara — Distribusi"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
      <div className="px-6 md:px-12 pb-8">
        <DpaBidangWidget
          bidangLabel="Distribusi Pangan"
          programKeyword="distribusi"
        />
        <RenstraBidangWidget
          bidangLabel="Distribusi Pangan"
          programKeyword="distribusi"
        />
      </div>

      {/* ─── Form Usulan Sub-Kegiatan — Priority 3 ─── */}
      <div className="px-6 md:px-12 pb-8">
        <div className="rounded-2xl border border-blue-700/50 bg-gradient-to-br from-blue-900/90 to-slate-900/80 p-6 shadow-xl mt-2">
          <h2 className="font-bold text-blue-100 text-lg mb-1">
            📝 Usulan Sub-Kegiatan — Bidang Distribusi
          </h2>
          <p className="text-xs text-blue-300/80 mb-4">
            Ajukan sub-kegiatan baru untuk perencanaan anggaran Bidang
            Distribusi.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!subKegForm.nama.trim()) return;
              setSubKegSubmitting(true);
              setSubKegResult(null);
              try {
                const res = await api.post("/api/sub-kegiatan-usul", {
                  nama_sub_kegiatan: subKegForm.nama,
                  sasaran: subKegForm.sasaran,
                  indikator: subKegForm.indikator,
                  pagu_usulan: subKegForm.pagu || undefined,
                  keterangan: subKegForm.keterangan,
                  bidang: "distribusi",
                });
                setSubKegResult({ ok: true });
                setSubKegForm({
                  nama: "",
                  sasaran: "",
                  indikator: "",
                  pagu: "",
                  keterangan: "",
                });
                if (res.data?.data) {
                  setSubKegList((prev) => [res.data.data, ...prev]);
                }
              } catch {
                setSubKegResult({ ok: false });
              } finally {
                setSubKegSubmitting(false);
              }
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-blue-200 block mb-1">
                  Nama Sub-Kegiatan <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  maxLength={300}
                  value={subKegForm.nama}
                  onChange={(e) =>
                    setSubKegForm((s) => ({ ...s, nama: e.target.value }))
                  }
                  placeholder="Contoh: Pemantauan Distribusi Pangan Daerah 2025"
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-blue-200 block mb-1">
                  Sasaran
                </label>
                <input
                  maxLength={300}
                  value={subKegForm.sasaran}
                  onChange={(e) =>
                    setSubKegForm((s) => ({ ...s, sasaran: e.target.value }))
                  }
                  placeholder="Sasaran kegiatan"
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-blue-200 block mb-1">
                  Indikator
                </label>
                <input
                  maxLength={300}
                  value={subKegForm.indikator}
                  onChange={(e) =>
                    setSubKegForm((s) => ({ ...s, indikator: e.target.value }))
                  }
                  placeholder="Indikator capaian"
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-blue-200 block mb-1">
                  Pagu Usulan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={subKegForm.pagu}
                  onChange={(e) =>
                    setSubKegForm((s) => ({ ...s, pagu: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-blue-200 block mb-1">
                  Keterangan
                </label>
                <input
                  maxLength={500}
                  value={subKegForm.keterangan}
                  onChange={(e) =>
                    setSubKegForm((s) => ({ ...s, keterangan: e.target.value }))
                  }
                  placeholder="Keterangan tambahan (opsional)"
                  className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={subKegSubmitting || !subKegForm.nama.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                {subKegSubmitting ? "Menyimpan…" : "📤 Ajukan Usulan"}
              </button>
              {subKegResult && (
                <span
                  className={`text-xs ${subKegResult.ok ? "text-emerald-300" : "text-red-300"}`}
                >
                  {subKegResult.ok
                    ? "✅ Usulan berhasil diajukan."
                    : "❌ Gagal menyimpan. Coba lagi."}
                </span>
              )}
            </div>
          </form>
          {(subKegListLoading || subKegList.length > 0) && (
            <div className="mt-5 pt-4 border-t border-slate-700/40">
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Usulan yang telah diajukan ({subKegList.length})
              </p>
              {subKegListLoading ? (
                <p className="text-xs text-slate-500 animate-pulse">
                  Memuat daftar…
                </p>
              ) : (
                <div className="space-y-1.5">
                  {subKegList.slice(0, 5).map((item, i) => (
                    <div
                      key={item.id ?? i}
                      className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 text-xs"
                    >
                      <span className="text-slate-200 truncate max-w-[70%]">
                        {item.nama_sub_kegiatan}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-medium flex-shrink-0">
                        {item.status || "diajukan"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── PANEL: EFEKTIVITAS DISTRIBUSI ─── */}
        <div
          className="mt-8 bg-blue-950/80 border-2 border-blue-700/50 rounded-2xl p-7 shadow-xl"
          style={{ backdropFilter: "blur(17px)" }}
        >
          <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
            <span className="text-2xl">📈</span> Efektivitas Distribusi
          </h2>
          {subKegListLoading ? (
            <p className="text-xs text-blue-300/70 animate-pulse">
              Memuat data efektivitas…
            </p>
          ) : (
            (() => {
              const total = subKegList.length;
              const selesai = subKegList.filter(
                (d) => d.status === "selesai" || d.status === "disetujui",
              ).length;
              const pending = subKegList.filter(
                (d) =>
                  !d.status ||
                  d.status === "diajukan" ||
                  d.status === "pending",
              ).length;
              const ditolak = subKegList.filter(
                (d) => d.status === "ditolak",
              ).length;
              const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
              const barColor =
                pct >= 80
                  ? "bg-green-400"
                  : pct >= 50
                    ? "bg-amber-400"
                    : "bg-red-400";
              return (
                <div>
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-blue-300">
                        % Sub-Kegiatan Selesai
                      </span>
                      <span className="text-lg font-bold text-white">
                        {total > 0 ? `${pct}%` : "—"}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-300">
                        {selesai}
                      </div>
                      <div className="text-xs text-green-400/80 mt-1">
                        Selesai / Disetujui
                      </div>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-amber-300">
                        {pending}
                      </div>
                      <div className="text-xs text-amber-400/80 mt-1">
                        Pending
                      </div>
                    </div>
                    <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-red-300">
                        {ditolak}
                      </div>
                      <div className="text-xs text-red-400/80 mt-1">
                        Ditolak
                      </div>
                    </div>
                  </div>
                  {total === 0 && (
                    <p className="text-xs text-blue-300/60 mt-4">
                      Belum ada sub-kegiatan yang diusulkan untuk Bidang
                      Distribusi.
                    </p>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
      </main>
    </DashboardDistribusiLayout>
  );
}
