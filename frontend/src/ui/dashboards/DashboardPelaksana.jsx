// frontend/src/ui/dashboards/DashboardPelaksana.jsx
// A-10: Dashboard Staf Pelaksana — Production Ready
// RBAC: pelaksana, staf_pelaksana
// Fitur: Task list, Form SPJ + upload bukti, View nilai kinerja (SKP), Notifikasi, Broadcast

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";
import BroadcastBidangPanel from "../../components/dashboard/BroadcastBidangPanel";
import FormSPJ from "../spj/FormSPJ";

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
  pending: "bg-gray-300",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
  terlambat: "bg-red-500",
};

const SPJ_STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const SKP_PREDIKAT = (nilai) => {
  if (!nilai) return { label: "Belum dinilai", cls: "text-gray-400" };
  if (nilai >= 90) return { label: "Sangat Baik", cls: "text-emerald-600" };
  if (nilai >= 75) return { label: "Baik", cls: "text-blue-600" };
  if (nilai >= 60) return { label: "Cukup", cls: "text-amber-600" };
  return { label: "Kurang", cls: "text-red-600" };
};

function formatRupiah(val) {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export default function DashboardPelaksana() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  // tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // KPI summary
  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // notifikasi
  const [notifList, setNotifList] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // SPJ daftar milik sendiri
  const [spjList, setSpjList] = useState([]);
  const [spjLoading, setSpjLoading] = useState(true);
  const [showFormSPJ, setShowFormSPJ] = useState(false);

  // SKP / Nilai Kinerja
  const [skpList, setSkpList] = useState([]);
  const [skpLoading, setSkpLoading] = useState(true);
  const [skpError, setSkpError] = useState("");

  const isAllowed = !!user && ALLOWED.includes(roleName);

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
    api.get("/dashboard/pelaksana/summary")
      .then((res) => setKpi(res.data?.data ?? null))
      .catch(() => setKpi(null))
      .finally(() => setKpiLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get("/tasks/assigned", { params: { limit: 15 } })
      .then((res) =>
        setTasks(
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data) ? res.data : [],
        ),
      )
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    api.get("/notifications?limit=10")
      .then((res) => {
        if (!cancelled) setNotifList(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => setNotifList([]))
      .finally(() => setNotifLoading(false));
    return () => { cancelled = true; };
  }, []);

  function loadSpj() {
    setSpjLoading(true);
    api.get("/spj/my", { params: { limit: 10 } })
      .then((res) => setSpjList(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setSpjList([]))
      .finally(() => setSpjLoading(false));
  }

  useEffect(() => {
    if (!user) return;
    loadSpj();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSkpLoading(true);
    api.get("/skp/my", { params: { limit: 5 } })
      .then((res) => setSkpList(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => {
        if (err.response?.status !== 404) setSkpError("Gagal memuat data SKP.");
        setSkpList([]);
      })
      .finally(() => setSkpLoading(false));
  }, [user]);

  if (!isAllowed) return <Navigate to="/" replace />;

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => !t.status || t.status === "pending").length;

  // Deteksi bidang dari unit kerja user
  let bidang = "";
  if (user?.unit_kerja?.toLowerCase().includes("ketersediaan")) bidang = "ketersediaan";
  else if (user?.unit_kerja?.toLowerCase().includes("distribusi")) bidang = "distribusi";
  else if (user?.unit_kerja?.toLowerCase().includes("konsumsi")) bidang = "konsumsi";

  const tujuanOptions = bidang
    ? [{ value: `fungsional_${bidang}`, label: `Fungsional ${bidang.charAt(0).toUpperCase() + bidang.slice(1)}` }]
    : [];
  const broadcastEndpoint = bidang ? `/notifications/broadcast-pelaksana-${bidang}` : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Skip link aksesibilitas */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-blue-700 text-white px-3 py-1 rounded z-50 text-sm">
        Langsung ke konten
      </a>

      {/* Broadcast ke Fungsional per Bidang */}
      {bidang && (
        <div className="mb-6">
          <BroadcastBidangPanel
            label={`Perintah/Broadcast ke Fungsional ${bidang.charAt(0).toUpperCase() + bidang.slice(1)}`}
            tujuanOptions={tujuanOptions}
            endpoint={broadcastEndpoint}
          />
        </div>
      )}

      {/* Hero */}
      <header
        id="main-content"
        className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-8 shadow-xl"
        role="banner"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span aria-hidden="true" className="text-4xl">⚙️</span>
          Dashboard Pelaksana
        </h1>
        <p className="text-blue-200/80 text-sm">
          Selamat datang,{" "}
          <span className="font-semibold text-white">{user?.nama_lengkap || user?.name || "—"}</span>{" "}
          · Unit: {user?.unit_kerja || "—"}
        </p>
      </header>

      {/* Panel Notifikasi Perintah Kasubag */}
      {!notifLoading &&
        notifList.filter((n) => n.message?.startsWith("[Perintah Kasubag → Pelaksana]")).length > 0 && (
          <section aria-labelledby="notif-heading" className="bg-amber-900/80 border border-amber-400/30 rounded-xl p-4 text-amber-100 text-sm space-y-2">
            <h2 id="notif-heading" className="font-bold text-amber-200 mb-1 flex items-center gap-2">
              <span aria-hidden="true">📢</span> Perintah Kasubag
            </h2>
            {notifList
              .filter((n) => n.message?.startsWith("[Perintah Kasubag → Pelaksana]"))
              .map((n, i) => (
                <div key={n.id ?? i} className="border-b border-amber-700/30 pb-2 last:border-0 last:pb-0">
                  <span>{n.message.replace("[Perintah Kasubag → Pelaksana]", "").trim()}</span>
                  <span className="block text-xs text-amber-300/70 mt-1">
                    {n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : ""}
                  </span>
                </div>
              ))}
          </section>
        )}

      {/* KPI Tasks */}
      <section aria-label="Ringkasan tugas" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tugas", value: tasksLoading ? "…" : tasks.length, color: "blue" },
          { label: "Sedang Dikerjakan", value: tasksLoading ? "…" : inProgress, color: "amber" },
          { label: "Selesai", value: tasksLoading ? "…" : done, color: "emerald" },
          { label: "Menunggu", value: tasksLoading ? "…" : pending, color: "gray" },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 bg-${item.color}-50 border-${item.color}-200`}
          >
            <div className={`text-3xl font-bold text-${item.color}-700`}>{item.value}</div>
            <div className={`text-xs font-medium text-${item.color}-600`}>{item.label}</div>
          </div>
        ))}
      </section>

      {/* Progress Bar */}
      {!tasksLoading && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">📈 Progress Keseluruhan</h2>
          <div role="progressbar" aria-valuenow={Math.round((done / tasks.length) * 100)} aria-valuemin={0} aria-valuemax={100} className="h-3 rounded-full bg-gray-200 overflow-hidden mb-1">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round((done / tasks.length) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500">{done} dari {tasks.length} tugas selesai ({Math.round((done / tasks.length) * 100)}%)</p>
        </div>
      )}

      {/* Daftar Tugas */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-labelledby="tugas-heading">
        <h2 id="tugas-heading" className="font-bold text-gray-800 mb-4">📋 Tugas Saya</h2>
        {tasksLoading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada tugas yang ditugaskan.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t, i) => (
              <li
                key={t.id ?? i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.judul || t.title || "—"}</div>
                  <div className="text-xs text-gray-500">{t.modul_id || t.modulId || ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    aria-label={`Status: ${t.status || "pending"}`}
                    className={`w-2.5 h-2.5 rounded-full ${PROGRESS_COLOR[t.status] ?? "bg-gray-300"}`}
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">{t.status || "pending"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── SPJ Section ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="spj-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="spj-heading" className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span aria-hidden="true">📄</span> Surat Pertanggungjawaban (SPJ)
          </h2>
          <button
            type="button"
            onClick={() => setShowFormSPJ((v) => !v)}
            aria-expanded={showFormSPJ}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            {showFormSPJ ? "Tutup Form" : "+ Buat SPJ"}
          </button>
        </div>

        {showFormSPJ && (
          <FormSPJ
            onCreated={() => {
              loadSpj();
              setShowFormSPJ(false);
            }}
          />
        )}

        {/* Daftar SPJ Saya */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Riwayat SPJ Saya</h3>
          {spjLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Memuat data SPJ…</p>
          ) : spjList.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Belum ada SPJ yang dibuat.</p>
          ) : (
            <ul className="space-y-2">
              {spjList.map((spj) => (
                <li key={spj.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{spj.judul}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {spj.kegiatan} · {spj.tanggal_kegiatan ? new Date(spj.tanggal_kegiatan).toLocaleDateString("id-ID") : "—"}
                    </p>
                    {spj.total_anggaran > 0 && (
                      <p className="text-xs text-gray-500">{formatRupiah(spj.total_anggaran)}</p>
                    )}
                    {spj.catatan_verifikasi && (
                      <p className="text-xs text-red-500 mt-0.5 italic">Catatan: {spj.catatan_verifikasi}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${SPJ_STATUS_STYLE[spj.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {spj.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Nilai Kinerja (SKP) ───────────────────────────────────────────── */}
      <section aria-labelledby="skp-heading" className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 id="skp-heading" className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span aria-hidden="true">🏆</span> Nilai Kinerja (SKP)
        </h2>
        {skpLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat data SKP…</p>
        ) : skpError ? (
          <p className="text-sm text-red-500">{skpError}</p>
        ) : skpList.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada data penilaian kinerja.</p>
        ) : (
          <div className="space-y-3">
            {skpList.map((skp) => {
              const predikat = SKP_PREDIKAT(skp.nilai_kuantitatif);
              return (
                <div key={skp.id} className="flex items-center justify-between gap-4 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Periode {skp.periode_tahun} — Semester {skp.periode_semester}
                    </p>
                    <p className="text-xs text-gray-500">{skp.jabatan || user?.jabatan || "—"} · {skp.unit_kerja || user?.unit_kerja || "—"}</p>
                    <p className={`text-xs font-medium mt-0.5 ${predikat.cls}`}>{predikat.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-blue-700">
                      {skp.nilai_kuantitatif != null ? Number(skp.nilai_kuantitatif).toFixed(2) : "—"}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{skp.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {skpList.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 italic">
            * Nilai ditentukan oleh atasan langsung. Hubungi Kasubag/Kabid untuk informasi lebih lanjut.
          </p>
        )}
      </section>

      {/* Target Sub-Kegiatan (read-only) */}
      <section className="bg-white rounded-xl border border-blue-100 shadow-sm p-5" aria-labelledby="target-heading">
        <h2 id="target-heading" className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎯 Target Sub-Kegiatan Saya (Read-Only)
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Daftar target sub-kegiatan unit kerja Anda. Kontribusi Anda adalah melalui{" "}
          <strong>data operasional</strong> yang Anda input — data ini digunakan JF untuk menyusun Renstra berbasis data.
        </p>
        <div className="flex flex-wrap gap-2">
          <BukaEPelaraButton label="Lihat Target (read-only) →" targetPath="/dashboard-renstra" className="!py-1.5 !px-3 !text-xs" />
          <BukaEPelaraButton label="Input Data Teknis Lapangan" targetPath="/input-laporan" className="!py-1.5 !px-3 !text-xs" />
        </div>
      </section>

      {/* e-Pelara */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-labelledby="epelara-heading">
        <h2 id="epelara-heading" className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>DRAFTER</strong> — Anda dapat membuat dan mengupdate draft dokumen perencanaan.
        </p>
        <BukaEPelaraButton label="Buka e-Pelara" targetPath="/" className="w-full md:w-auto" />
      </section>
    </div>
  );
}
