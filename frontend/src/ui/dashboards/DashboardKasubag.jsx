import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import SekretariatSubordinateWorkspace from "../../components/coordination/SekretariatSubordinateWorkspace";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import TugasMandiriKasubagPanel from "../../components/kasubag/TugasMandiriKasubagPanel";
import ModulFormPanel from "../../components/ModulFormPanel";
import api from "../../services/api";

function normalizeRoleName(user) {
  const v =
    (user?.roleName && String(user.roleName)) ||
    (user?.role && String(user.role)) ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null;
  return v
    ? String(v)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_")
    : null;
}

const ALLOWED = [
  "kasubag_umum_kepegawaian",
  "kasubag",
  "kasubbag",
  "kasubbag_umum",
  "kasubbag_kepegawaian",
  "super_admin",
  "sekretaris",
  "kepala_dinas",
];

function DashboardKasubag() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [unitTasks, setUnitTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [inboxRows, setInboxRows] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [verifRows, setVerifRows] = useState([]);
  const [verifLoading, setVerifLoading] = useState(true);
  const [kanban, setKanban] = useState(null);
  const [kanbanLoading, setKanbanLoading] = useState(true);
  const [coordinationHighlightId, setCoordinationHighlightId] = useState(null);
  /** Setelah buka tab Inbox Sekretaris: baseline count — badge hilang sampai jumlah naik lagi. */
  const [inboxBadgeBaseline, setInboxBadgeBaseline] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const processedCoordTaskRef = useRef(null);

  useEffect(() => {
    const raw = searchParams.get("coordinationTask");
    if (!raw || processedCoordTaskRef.current === raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id)) return;
    processedCoordTaskRef.current = raw;
    setActiveMenu("inbox");
    setCoordinationHighlightId(id);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.delete("coordinationTask");
        return n;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (coordinationHighlightId == null) return;
    const t = setTimeout(() => setCoordinationHighlightId(null), 8000);
    return () => clearTimeout(t);
  }, [coordinationHighlightId]);

  function goToSekretarisInboxTask(taskId) {
    setActiveMenu("inbox");
    setCoordinationHighlightId(Number(taskId));
  }

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KSB-001",
        status: "akses",
        detail: "Akses dashboard Kasubag Umum & Kepegawaian",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/tasks/unit", { params: { limit: 10 } })
      .then((res) =>
        setUnitTasks(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setUnitTasks([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSummaryLoading(true);
    api
      .get("/api/kasubag/dashboard/summary")
      .then((res) => setSummary(res.data?.data || null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setInboxLoading(true);
    api
      .get("/api/kasubag/inbox-sekretaris", { params: { limit: 12 } })
      .then((res) =>
        setInboxRows(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setInboxRows([]))
      .finally(() => setInboxLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setVerifLoading(true);
    api
      .get("/api/kasubag/verifikasi", { params: { limit: 12 } })
      .then((res) =>
        setVerifRows(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setVerifRows([]))
      .finally(() => setVerifLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setKanbanLoading(true);
    api
      .get("/api/kasubag/tim/kanban")
      .then((res) => setKanban(res.data?.data || null))
      .catch(() => setKanban(null))
      .finally(() => setKanbanLoading(false));
  }, [user]);

  useEffect(() => {
    if (activeMenu !== "inbox") return;
    if (summaryLoading) return;
    const n = Number(summary?.inbox_sekretaris ?? 0);
    setInboxBadgeBaseline(Number.isFinite(n) ? n : 0);
  }, [activeMenu, summary?.inbox_sekretaris, summaryLoading]);

  const inboxNavBadge = useMemo(() => {
    if (summaryLoading) return null;
    const cur = Number(summary?.inbox_sekretaris ?? 0);
    if (!Number.isFinite(cur) || cur <= 0) return null;
    if (inboxBadgeBaseline === null) return cur;
    return cur > inboxBadgeBaseline ? cur : null;
  }, [summaryLoading, summary?.inbox_sekretaris, inboxBadgeBaseline]);

  const SIDEBAR_MENU = useMemo(
    () => [
      { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
      {
        id: "inbox",
        label: "Inbox Sekretaris",
        icon: "📥",
        badge: inboxNavBadge,
      },
      {
        id: "verif",
        label: "Verifikasi Queue",
        icon: "🔍",
        badge: summaryLoading ? null : summary?.verifikasi_queue || null,
      },
      {
        id: "komunikasi",
        label: "Tanggapan & diskusi",
        icon: "💬",
        badge: null,
      },
      { id: "unit", label: "Tugas Unit", icon: "📋", badge: null },
      { id: "tugas_mandiri", label: "Buat Tugas ke Pelaksana", icon: "📝", badge: null },
      { divider: true, label: "MODUL KEPEGAWAIAN" },
      { id: "asn", label: "Data ASN & Profil", icon: "👤" },
      {
        id: "kgb",
        label: "Tracking KGB (Semua ASN)",
        icon: "🎯",
        badge: summaryLoading ? null : summary?.kgb_alert_30hari || null,
      },
      { id: "pangkat", label: "Tracking Pangkat", icon: "📈" },
      { id: "cuti", label: "Data Cuti", icon: "📋" },
      { id: "sppd", label: "Perjalanan Dinas (SPPD)", icon: "✈️" },
      { id: "diklat", label: "Diklat & Pelatihan", icon: "🎓" },
      { id: "absensi", label: "Absensi & Kehadiran", icon: "📅" },
      { divider: true, label: "KINERJA" },
      { id: "scorecard", label: "Nilai Kinerja Pelaksana", icon: "🎯" },
      { id: "tim", label: "Tim Saya", icon: "👥" },
    ],
    [summary, summaryLoading, inboxNavBadge],
  );

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const PanelBox = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );

  // ── Komponen Verifikasi Queue — tampilan kartu penuh ──────────────────────
  function VerifikasiQueuePanel({ rows, loading, onRefresh, onRemove }) {
    const [kembalikanId, setKembalikanId] = useState(null);
    const [catatan, setCatatan] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    async function handleVerifikasi(taskId) {
      setActionLoading(true);
      try {
        await api.post(`/api/kasubag/verifikasi/${taskId}/ok`);
        onRemove(taskId);
      } catch {/* ignore */}
      finally { setActionLoading(false); }
    }

    async function handleKembalikan(taskId) {
      if (!catatan.trim()) return;
      setActionLoading(true);
      try {
        await api.post(`/api/kasubag/verifikasi/${taskId}/kembalikan`, { catatan: catatan.trim() });
        onRemove(taskId);
        setKembalikanId(null);
        setCatatan("");
      } catch {/* ignore */}
      finally { setActionLoading(false); }
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-base">🔍 Verifikasi Queue</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Laporan hasil tugas dari Pelaksana yang menunggu verifikasi dan persetujuan Anda.
              </p>
            </div>
            <button onClick={onRefresh} className="text-xs text-cyan-600 hover:underline font-semibold shrink-0">
              Muat ulang
            </button>
          </div>

          <div className="p-5">
            {loading ? (
              <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
            ) : rows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm font-semibold text-gray-600">Tidak ada tugas yang menunggu verifikasi</p>
                <p className="text-xs text-gray-400 mt-1">Semua laporan dari Pelaksana sudah ditangani.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((t) => {
                  const submit = t.metadata?.pelaksana_submit || {};
                  const submittedAt = submit.submitted_at
                    ? new Date(submit.submitted_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : null;
                  const isExpanded = expandedId === t.id;
                  const revisiKe = Number(t.revisi_ke || 0);

                  return (
                    <div key={t.id} className="border border-amber-200 rounded-xl bg-amber-50 overflow-hidden">
                      {/* Header kartu */}
                      <div className="px-4 pt-3 pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 leading-snug">
                              {t.priority === "high" && <span className="text-red-500 mr-1">🔴</span>}
                              {t.title || `Tugas #${t.id}`}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {t.module && (
                                <span className="text-[10px] font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">
                                  {t.module}
                                </span>
                              )}
                              {revisiKe > 0 && (
                                <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-300 rounded px-1.5 py-0.5 font-semibold">
                                  Revisi ke-{revisiKe}
                                </span>
                              )}
                              {submittedAt && (
                                <span className="text-[10px] text-gray-500">
                                  Disubmit: {submittedAt}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 shrink-0 border border-amber-300 bg-white rounded-lg px-2 py-1"
                          >
                            {isExpanded ? "Tutup ▲" : "Detail ▼"}
                          </button>
                        </div>
                      </div>

                      {/* Detail konten (expanded) */}
                      {isExpanded && (
                        <div className="px-4 pb-3 space-y-2 border-t border-amber-200 pt-3">
                          {/* Ringkasan hasil */}
                          {submit.output_ringkas ? (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-0.5">Ringkasan Hasil (dari Pelaksana)</p>
                              <p className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap">
                                {submit.output_ringkas}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Ringkasan hasil tidak tersedia.</p>
                          )}
                          {/* Tautan dokumen */}
                          {submit.output_url && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-0.5">Dokumen Pendukung</p>
                              <a
                                href={submit.output_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-cyan-700 hover:underline font-semibold bg-white border border-cyan-200 rounded-lg px-3 py-1.5"
                              >
                                🔗 Buka Dokumen
                              </a>
                            </div>
                          )}
                          {/* Riwayat revisi */}
                          {revisiKe > 0 && Array.isArray(t.metadata?.revision_history) && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-0.5">Riwayat Revisi</p>
                              <div className="space-y-1">
                                {t.metadata.revision_history.map((r, i) => (
                                  <div key={i} className="text-[11px] bg-white border border-red-100 rounded px-2 py-1 text-red-800">
                                    <span className="font-bold">Revisi {r.revisi_ke}:</span> {r.note}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Panel catatan kembalikan */}
                      {kembalikanId === t.id && (
                        <div className="px-4 pb-3 border-t border-red-200 pt-3 bg-red-50 space-y-2">
                          <p className="text-xs font-semibold text-red-700">Catatan Perbaikan untuk Pelaksana <span className="text-red-500">*</span></p>
                          <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            rows={3}
                            placeholder="Jelaskan apa yang perlu diperbaiki…"
                            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setKembalikanId(null); setCatatan(""); }}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleKembalikan(t.id)}
                              disabled={!catatan.trim() || actionLoading}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
                            >
                              {actionLoading ? "Mengirim…" : "Kembalikan ke Pelaksana"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tombol aksi */}
                      {kembalikanId !== t.id && (
                        <div className="px-4 pb-3 flex gap-2 justify-end border-t border-amber-200 pt-2">
                          <button
                            onClick={() => { setKembalikanId(t.id); setCatatan(""); setExpandedId(t.id); }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition"
                          >
                            ↩️ Kembalikan
                          </button>
                          <button
                            onClick={() => handleVerifikasi(t.id)}
                            disabled={actionLoading}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition"
                          >
                            ✅ Verifikasi & Setujui
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES4_OPERATOR}
            titleTanggapan="Tanggapan Pelaksana / Bendahara"
            titleDiskusi="Diskusi dengan pelaksana / bendahara (task)"
          />
        );
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  label: "Inbox Sekretaris",
                  value: summaryLoading
                    ? "…"
                    : (summary?.inbox_sekretaris ?? "—"),
                  color: "rose",
                },
                {
                  label: "Verifikasi Queue",
                  value: summaryLoading
                    ? "…"
                    : (summary?.verifikasi_queue ?? "—"),
                  color: "amber",
                },
                {
                  label: "KGB Alert (H-30)",
                  value: summaryLoading
                    ? "…"
                    : (summary?.kgb_alert_30hari ?? "—"),
                  color: "red",
                },
                {
                  label: "SLA Tim",
                  value: summaryLoading ? "…" : (summary?.sla_tim_pct ?? "—"),
                  color: "emerald",
                },
                {
                  label: "Kinerja Pelaksana",
                  value: summaryLoading
                    ? "…"
                    : (summary?.skor_kinerja_pelaksana_avg ?? "—"),
                  color: "cyan",
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
                >
                  <div className={`text-3xl font-bold text-${kpi.color}-700`}>
                    {kpi.value}
                  </div>
                  <div className={`text-xs font-medium text-${kpi.color}-700`}>
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanelBox title="📥 Inbox Sekretaris — Tugas untuk Kasubag">
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Ringkasan penugasan. Untuk detail agenda, referensi, dan
                  laporan balik ke Sekretaris, buka menu{" "}
                  <button
                    type="button"
                    className="font-semibold text-cyan-700 underline"
                    onClick={() => setActiveMenu("inbox")}
                  >
                    Inbox Sekretaris
                  </button>
                  .
                </p>
                {inboxLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : inboxRows.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Tidak ada item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inboxRows.slice(0, 8).map((t) => (
                      <div
                        key={t.id}
                        className="border border-gray-100 bg-slate-50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {t.title || `Tugas #${t.id}`}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Prioritas: {t.priority ?? "—"} · Status:{" "}
                              {t.status || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => goToSekretarisInboxTask(t.id)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
                          >
                            Buka di Inbox Sekretaris
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>

              <PanelBox title="🔍 Verifikasi Queue — Menunggu verifikasi Kasubag">
                {verifLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : verifRows.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Tidak ada item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {verifRows.slice(0, 8).map((t) => (
                      <div
                        key={t.id}
                        className="border border-gray-100 bg-amber-50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {t.title || `Tugas #${t.id}`}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              Status: {t.status || "—"} · Update:{" "}
                              {t.updated_at
                                ? String(t.updated_at).slice(0, 10)
                                : "—"}
                            </div>
                          </div>
                          <a
                            href="/tasks"
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 shrink-0"
                          >
                            Daftar tugas
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>
            </div>
          </div>
        );
      case "inbox":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-2">
                📥 Inbox Sekretaris
              </h2>
              <p className="text-xs text-gray-600 mb-4">
                Satu halaman untuk perintah dari Sekretaris, tanggapan, laporan
                balik, dan outbox koordinasi ke Sekretaris.
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Ringkas — penugasan ke akun Anda
                </p>
                {inboxLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : inboxRows.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Tidak ada item ringkas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inboxRows.map((t) => (
                      <div
                        key={t.id}
                        className="border border-gray-100 rounded-lg p-3 bg-slate-50 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="min-w-0 text-sm font-medium text-gray-800 truncate">
                          {t.title || `Tugas #${t.id}`}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => goToSekretarisInboxTask(t.id)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          >
                            Sorot di bawah
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              api
                                .post(`/tasks/${t.id}/accept`)
                                .then(() => {
                                  setInboxRows((rows) =>
                                    rows.map((r) =>
                                      r.id === t.id
                                        ? { ...r, status: "accepted" }
                                        : r,
                                    ),
                                  );
                                })
                                .catch(() => {})
                            }
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
                          >
                            Konfirmasi Terima
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <SekretariatSubordinateWorkspace
              actorRole={roleName}
              actorLabel="Kasubag Umum & Kepegawaian"
              highlightTaskId={coordinationHighlightId}
            />
          </div>
        );
      case "verif":
        return <VerifikasiQueuePanel
          rows={verifRows}
          loading={verifLoading}
          onRefresh={() => {
            setVerifLoading(true);
            api.get("/api/kasubag/verifikasi", { params: { limit: 20 } })
              .then((res) => setVerifRows(Array.isArray(res.data?.data) ? res.data.data : []))
              .catch(() => setVerifRows([]))
              .finally(() => setVerifLoading(false));
          }}
          onRemove={(id) => setVerifRows((rows) => rows.filter((r) => r.id !== id))}
        />;
      case "tim":
        return (
          <PanelBox title="👥 Tim Saya — Kanban Task Pelaksana">
            {kanbanLoading ? (
              <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
            ) : !kanban ? (
              <p className="text-sm text-gray-400 italic">
                Belum ada data tim (pastikan relasi{" "}
                <span className="font-mono">user_hierarchy</span>).
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {[
                  {
                    key: "todo",
                    title: "TO DO",
                    tone: "bg-slate-50 border-slate-200",
                  },
                  {
                    key: "in_progress",
                    title: "IN PROGRESS",
                    tone: "bg-blue-50 border-blue-200",
                  },
                  {
                    key: "menunggu_review",
                    title: "MENUNGGU REVIEW",
                    tone: "bg-amber-50 border-amber-200",
                  },
                  {
                    key: "dikembalikan",
                    title: "DIKEMBALIKAN",
                    tone: "bg-red-50 border-red-200",
                  },
                  {
                    key: "selesai",
                    title: "SELESAI",
                    tone: "bg-emerald-50 border-emerald-200",
                  },
                ].map((lane) => {
                  const items = Array.isArray(kanban?.lanes?.[lane.key])
                    ? kanban.lanes[lane.key]
                    : [];
                  return (
                    <div
                      key={lane.key}
                      className={`rounded-xl border ${lane.tone} p-3`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-slate-700">
                          {lane.title}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          {items.length}
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Kosong</p>
                      ) : (
                        <div className="space-y-2">
                          {items.slice(0, 12).map((it) => (
                            <div
                              key={it.id}
                              className="bg-white/80 border border-white rounded-lg p-2"
                            >
                              <div className="text-xs font-semibold text-slate-800 truncate">
                                {it.title || `Task #${it.id}`}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Pelaksana #{it.assignee_user_id} · Revisi:{" "}
                                {it.revisi_ke ?? 0}
                              </div>
                              {lane.key === "dikembalikan" &&
                              it.catatan_verifikasi ? (
                                <div className="text-[11px] text-red-700 mt-1 line-clamp-2">
                                  Catatan: {it.catatan_verifikasi}
                                </div>
                              ) : null}
                              <div className="mt-1">
                                <button
                                  type="button"
                                  onClick={() => goToSekretarisInboxTask(it.id)}
                                  className="text-[11px] font-semibold text-slate-700 hover:underline"
                                >
                                  Buka di Inbox Sekretaris →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PanelBox>
        );
      case "tugas_mandiri":
        return (
          <TugasMandiriKasubagPanel
            onTugasDibuat={() => {
              /* refresh kanban setelah tugas baru dibuat */
              setKanbanLoading(true);
              api
                .get("/api/kasubag/tim/kanban")
                .then((res) => setKanban(res.data?.data || null))
                .catch(() => setKanban(null))
                .finally(() => setKanbanLoading(false));
            }}
          />
        );
      case "unit":
        return (
          <PanelBox title="📋 Tugas Unit">
            {loading ? (
              <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
            ) : unitTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {unitTasks.map((t) => (
                  <div
                    key={t.id}
                    className="border border-gray-100 bg-slate-50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {t.judul || t.title || `Tugas #${t.id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Status: {t.status || "—"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToSekretarisInboxTask(t.id)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
                      >
                        Buka di Inbox Sekretaris
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelBox>
        );
      // ── MODUL KEPEGAWAIAN ─────────────────────────────────────────────────
      case "asn":
        return <ModulFormPanel modulId="M001" title="Data ASN & Profil Pegawai" layout="two-column" showHistory />;
      case "kgb":
        return <ModulFormPanel modulId="M002" title="Tracking KGB (Kenaikan Gaji Berkala)" layout="two-column" showHistory />;
      case "pangkat":
        return (
          <div className="space-y-5">
            <ModulFormPanel modulId="M003" title="Tracking Kenaikan Pangkat" layout="two-column" showHistory />
            <ModulFormPanel modulId="M004" title="Tracking Penghargaan" layout="two-column" showHistory />
          </div>
        );
      case "cuti":
        return <ModulFormPanel modulId="M005" title="Data Cuti ASN" layout="two-column" showHistory />;
      case "sppd":
        return <ModulFormPanel modulId="M006" title="SPPD / Perjalanan Dinas" layout="two-column" showHistory />;
      case "diklat":
        return (
          <div className="space-y-5">
            <ModulFormPanel modulId="M007" title="Diklat & Pelatihan" layout="two-column" showHistory />
            <ModulFormPanel modulId="M008" title="SKP (Sasaran Kinerja Pegawai)" layout="two-column" showHistory />
          </div>
        );
      case "absensi":
        return (
          <div className="space-y-5">
            <ModulFormPanel modulId="M009" title="Database Kepegawaian" layout="two-column" showHistory />
            <ModulFormPanel modulId="M010" title="Arsip Digital Kepegawaian" layout="two-column" showHistory />
          </div>
        );
      case "scorecard":
        return (
          <div className="space-y-5">
            <ModulFormPanel modulId="M011" title="Surat Masuk" layout="two-column" showHistory />
            <ModulFormPanel modulId="M012" title="Surat Keluar" layout="two-column" showHistory />
            <ModulFormPanel modulId="M013" title="Disposisi Surat" layout="two-column" showHistory />
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">
              Modul ini sedang dalam pengembangan.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-[min(18rem,88vw)] max-w-[100vw] bg-slate-900 flex flex-col transition-transform duration-200 shrink-0`}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">
                Kasubag Umum & Kepegawaian
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  activeMenu === item.id
                    ? "bg-cyan-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <BukaEPelaraButton
            label="e-Pelara"
            targetPath="/"
            className="w-full !py-2 !text-xs"
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="bg-gradient-to-r from-cyan-900/95 to-slate-900/80 px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">
                Kasubag Umum & Kepegawaian
              </h1>
              <p className="text-cyan-200/70 text-xs">
                {user?.nama_lengkap || user?.name || "—"} ·{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-cyan-200/60 text-[11px]">
                Unit:{" "}
                <span className="font-semibold text-white">
                  {user?.unit_kerja || "—"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <UploadSuratMasukQuickAction showBendaharaHint />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

DashboardKasubag.displayName = "DashboardKasubag";
export default DashboardKasubag;
