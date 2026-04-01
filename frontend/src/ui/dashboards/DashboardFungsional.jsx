// frontend/src/ui/dashboards/DashboardFungsional.jsx
// A-10: Dashboard untuk peran jabatan_fungsional / pejabat_fungsional
// e-Pelara role mapping (D-10):
//   JF di Bidang            → ADMINISTRATOR (approve + verifikasi teknis)
//   JF di Sekretariat/UPTD  → PENGAWAS (view-only)
// P12 + P15: JF Ketersediaan & Distribusi — satu dashboard, konten adaptif per unit_kerja
import React, { useEffect, useMemo, useState } from "react";
import JfVerifikasiDataMasukPanel from "../../components/jfBidang/JfVerifikasiDataMasukPanel";
import WorkspaceAnalisaDistribusi from "../../components/jfBidang/workspace/WorkspaceAnalisaDistribusi";
import WorkspaceAnalisaKetersediaan from "../../components/jfBidang/workspace/WorkspaceAnalisaKetersediaan";
import WorkspaceAnalisaKonsumsi from "../../components/jfBidang/workspace/WorkspaceAnalisaKonsumsi";
import WorkspaceVerifikasiUptd from "../../components/jfBidang/workspace/WorkspaceVerifikasiUptd";
import TimPelaksanaPanel from "../../components/jfBidang/TimPelaksanaPanel";
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

function normalizeUnit(user) {
  return user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
}

const ALLOWED = [
  "jabatan_fungsional",
  "pejabat_fungsional",
  "fungsional",
  "fungsional_perencana",
  "fungsional_keuangan",
  "ppk",
  "super_admin",
  "kepala_dinas",
];

export default function DashboardFungsional() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const isSekretariat = unit.includes("sekretariat");
  const isPerencana =
    String(roleName || "").includes("perencana") ||
    String(roleName || "").includes("perencanaan");
  const isKeuanganPpk =
    String(roleName || "").includes("keuangan") || String(roleName || "").includes("ppk");

  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [cascadeData, setCascadeData] = useState(null);
  const [cascadeLoading, setCascadeLoading] = useState(false);
  const [verifCount, setVerifCount] = useState(null);

  const isBidang =
    unit.includes("ketersediaan") ||
    unit.includes("distribusi") ||
    unit.includes("konsumsi");
  const isUptd = unit.includes("uptd");
  const epelараRole = isBidang ? "ADMINISTRATOR" : "PENGAWAS";

  // ────────────────────────────────────────────────────────────────────────────
  // Prompt 5/6: Mode Sekretariat (JF Perencanaan / JF Keuangan-PPK)
  // ────────────────────────────────────────────────────────────────────────────
  const [sekMenu, setSekMenu] = useState("overview");
  const [sekSummary, setSekSummary] = useState(null);
  const [sekInbox, setSekInbox] = useState([]);
  const [sekInboxLoading, setSekInboxLoading] = useState(false);
  const [sekAnalisa, setSekAnalisa] = useState([]);
  const [sekAnalisaLoading, setSekAnalisaLoading] = useState(false);
  const [sekDikembalikan, setSekDikembalikan] = useState([]);
  const [sekDikembalikanLoading, setSekDikembalikanLoading] = useState(false);
  const [activeAnalisa, setActiveAnalisa] = useState(null);
  const [draft, setDraft] = useState({
    judul: "",
    jenis_analisa: "analisa_renja",
    dokumen_input_url: "",
    sumber_data_epelara: "",
    catatan_teknis: "",
    rekomendasi: "",
    dokumen_hasil_url: "",
    tujuan_submit: "sekretaris",
  });

  const sekBase = isPerencana
    ? "/api/jf-perencanaan"
    : isKeuanganPpk
      ? "/api/jf-keuangan"
      : null;

  useEffect(() => {
    if (!user) return;
    if (!isSekretariat) return;
    if (!sekBase) return;
    // summary
    api
      .get(`${sekBase}/dashboard/summary`)
      .then((r) => setSekSummary(r.data?.data ?? null))
      .catch(() => setSekSummary(null));
  }, [user, isSekretariat, sekBase]);

  useEffect(() => {
    if (!user) return;
    if (!isSekretariat) return;
    if (!sekBase) return;
    if (sekMenu !== "inbox") return;
    setSekInboxLoading(true);
    api
      .get(`${sekBase}/inbox-sekretaris`, { params: { limit: 25 } })
      .then((r) => setSekInbox(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setSekInbox([]))
      .finally(() => setSekInboxLoading(false));
  }, [user, isSekretariat, sekBase, sekMenu]);

  useEffect(() => {
    if (!user) return;
    if (!isSekretariat) return;
    if (!sekBase) return;
    if (sekMenu !== "hasil") return;
    setSekAnalisaLoading(true);
    api
      .get(`${sekBase}/analisa`, { params: { limit: 80 } })
      .then((r) => setSekAnalisa(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setSekAnalisa([]))
      .finally(() => setSekAnalisaLoading(false));
  }, [user, isSekretariat, sekBase, sekMenu]);

  useEffect(() => {
    if (!user) return;
    if (!isSekretariat) return;
    if (!sekBase) return;
    if (sekMenu !== "dikembalikan") return;
    setSekDikembalikanLoading(true);
    api
      .get(`${sekBase}/analisa/dikembalikan`)
      .then((r) =>
        setSekDikembalikan(Array.isArray(r.data?.data) ? r.data.data : []),
      )
      .catch(() => setSekDikembalikan([]))
      .finally(() => setSekDikembalikanLoading(false));
  }, [user, isSekretariat, sekBase, sekMenu]);

  async function refreshSummary() {
    if (!sekBase) return;
    try {
      const r = await api.get(`${sekBase}/dashboard/summary`);
      setSekSummary(r.data?.data ?? null);
    } catch {
      // ignore
    }
  }

  async function handleKonfirmasiTerima(taskId) {
    await api.post(`${sekBase}/inbox-sekretaris/${taskId}/konfirmasi`);
    await refreshSummary();
    setSekInbox((prev) => prev.filter((t) => String(t.id) !== String(taskId)));
  }

  async function handleCreateDraft() {
    const payload = {
      ...draft,
      periode_tahun: new Date().getFullYear(),
    };
    const r = await api.post(`${sekBase}/analisa`, payload);
    const row = r.data?.data;
    if (row) {
      setActiveAnalisa(row);
      setDraft((d) => ({ ...d, judul: "", catatan_teknis: "", rekomendasi: "" }));
      setSekMenu("hasil");
    }
  }

  async function handleSubmitAnalisa(row, tujuan) {
    await api.post(`${sekBase}/analisa/${row.id}/submit`, {
      tujuan_submit: tujuan,
      catatan_teknis: row.catatan_teknis,
      rekomendasi: row.rekomendasi,
      dokumen_hasil_url: row.dokumen_hasil_url,
    });
    await refreshSummary();
    if (sekMenu === "hasil") {
      const r = await api.get(`${sekBase}/analisa`, { params: { limit: 80 } });
      setSekAnalisa(Array.isArray(r.data?.data) ? r.data.data : []);
    }
  }

  async function handleSubmitRevisi(row) {
    const catatan = window.prompt(
      "Catatan respons revisi (wajib). Contoh: 'Sudah diperbaiki karena...'",
    );
    if (!catatan) return;
    await api.post(`${sekBase}/analisa/${row.id}/revisi`, {
      catatan_respons: catatan,
      dokumen_hasil_url: row.dokumen_hasil_url,
    });
    await refreshSummary();
    const r = await api.get(`${sekBase}/analisa/dikembalikan`);
    setSekDikembalikan(Array.isArray(r.data?.data) ? r.data.data : []);
  }

  const [cov, setCov] = useState(null);
  useEffect(() => {
    if (!unit.includes("distribusi")) return;
    api
      .get("/api/jf-distribusi/harga/coverage-hari-ini")
      .then((r) => setCov(r.data?.data ?? null))
      .catch(() => setCov(null));
  }, [unit]);

  const workspaceAnalisa = useMemo(() => {
    if (unit.includes("ketersediaan")) {
      return <WorkspaceAnalisaKetersediaan />;
    }
    if (unit.includes("distribusi")) {
      return <WorkspaceAnalisaDistribusi />;
    }
    if (unit.includes("konsumsi")) {
      return <WorkspaceAnalisaKonsumsi />;
    }
    if (unit.includes("uptd")) {
      return <WorkspaceVerifikasiUptd />;
    }
    return null;
  }, [unit]);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "JF-001",
        status: "akses",
        detail: "Akses modul Jabatan Fungsional",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/tasks/assigned", { params: { limit: 10 } })
      .then((res) =>
        setTugas(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setTugas([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!isBidang) return;
    const base = unit.includes("ketersediaan")
      ? "/api/jf-ketersediaan"
      : unit.includes("distribusi")
        ? "/api/jf-distribusi"
        : unit.includes("konsumsi")
          ? "/api/jf-konsumsi"
          : null;
    if (!base) return;
    api
      .get(`${base}/verifikasi/masuk`)
      .then((res) => {
        const total =
          typeof res.data?.total === "number"
            ? res.data.total
            : Array.isArray(res.data?.data)
              ? res.data.data.length
              : 0;
        setVerifCount(total);
      })
      .catch(() => setVerifCount(0));
  }, [user, isBidang, unit]);

  // Fetch status dokumen renstra yang diajukan oleh unit JF ini (review dari atasan)
  useEffect(() => {
    if (!user) return;
    if (isUptd) {
      setReviewData([]);
      setReviewLoading(false);
      return;
    }
    setReviewLoading(true);
    api
      .get("/api/epelara/renstra-opd", { params: { limit: 8 } })
      .then((res) => {
        const d = res.data;
        // Filter by unit kerja user (client-side)
        const all = Array.isArray(d) ? d : d?.data || [];
        const unitKw = unit
          .split("/")[0]
          .replace(/bidang/gi, "")
          .trim();
        const filtered = unitKw
          ? all.filter((r) =>
              String(r.unit_kerja ?? r.opd ?? "")
                .toLowerCase()
                .includes(unitKw),
            )
          : all;
        setReviewData(filtered.slice(0, 8));
      })
      .catch(() => setReviewData([]))
      .finally(() => setReviewLoading(false));
  }, [user, unit, isUptd]);

  // Cascading check dari e-Pelara
  useEffect(() => {
    if (!user) return;
    setCascadeLoading(true);
    api
      .get("/api/epelara/cascading")
      .then((res) => setCascadeData(res.data ?? null))
      .catch(() => setCascadeData(null))
      .finally(() => setCascadeLoading(false));
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  // ─── Render Sekretariat JF Perencana/PPK mode ────────────────────────────────
  if (isSekretariat && sekBase && (isPerencana || isKeuanganPpk)) {
    const tiles = isPerencana
      ? [
          {
            label: "Inbox Sekretaris",
            value: sekSummary?.inbox_sekretaris ?? "—",
            tone:
              (sekSummary?.inbox_sekretaris || 0) > 0
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-700",
          },
          {
            label: "Analisa Queue",
            value: sekSummary?.analisa_queue ?? "—",
            tone:
              (sekSummary?.analisa_queue || 0) > 3
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-700",
          },
          {
            label: "Dikembalikan",
            value: sekSummary?.dikembalikan ?? "—",
            tone:
              (sekSummary?.dikembalikan || 0) > 0
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-700",
          },
          {
            label: "Disetujui Bulan Ini",
            value: sekSummary?.disetujui_bulan_ini ?? "—",
            tone: "bg-emerald-50 border-emerald-200 text-emerald-700",
          },
          {
            label: "SLA Analisa",
            value: `${sekSummary?.sla_analisa ?? "—"}%`,
            tone:
              (sekSummary?.sla_analisa || 0) >= 85
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : (sekSummary?.sla_analisa || 0) >= 70
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-rose-50 border-rose-200 text-rose-700",
          },
        ]
      : [
          {
            label: "Inbox Sekretaris",
            value: sekSummary?.inbox_sekretaris ?? "—",
            tone:
              (sekSummary?.inbox_sekretaris || 0) > 0
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-700",
          },
          {
            label: "PPK Queue",
            value: sekSummary?.ppk_queue ?? "—",
            tone: "bg-amber-50 border-amber-200 text-amber-700",
          },
          {
            label: "Dikembalikan",
            value: sekSummary?.dikembalikan ?? "—",
            tone:
              (sekSummary?.dikembalikan || 0) > 0
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-700",
          },
          {
            label: "Realisasi %",
            value: sekSummary?.realisasi_pct != null ? `${sekSummary.realisasi_pct}%` : "—",
            tone: "bg-emerald-50 border-emerald-200 text-emerald-700",
          },
          {
            label: "Temuan SPJ",
            value: sekSummary?.temuan_spj ?? "—",
            tone: "bg-rose-50 border-rose-200 text-rose-700",
          },
          {
            label: "SLA Verifikasi",
            value: sekSummary?.sla_verif != null ? `${sekSummary.sla_verif}%` : "—",
            tone: "bg-slate-50 border-slate-200 text-slate-700",
          },
        ];

    const sidebarItems = [
      { id: "overview", label: "📊 Dashboard", badge: null },
      {
        id: "inbox",
        label: "📥 Inbox Sekretaris",
        badge: sekSummary?.inbox_sekretaris ?? null,
      },
      isPerencana
        ? {
            id: "workspace",
            label: "🧩 Workspace Analisa",
            badge: null,
          }
        : null,
      isKeuanganPpk
        ? {
            id: "ppk",
            label: "🔍 Verifikasi PPK Queue",
            badge: sekSummary?.ppk_queue ?? null,
          }
        : null,
      { id: "hasil", label: "📤 Hasil Analisa Saya", badge: null },
      {
        id: "dikembalikan",
        label: "↩️ Dikembalikan",
        badge: sekSummary?.dikembalikan ?? null,
      },
      { id: "epelara", label: "🔗 Referensi e-Pelara", badge: null },
    ].filter(Boolean);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <aside className="w-[280px] bg-slate-900 text-slate-100 min-h-screen hidden md:block">
            <div className="px-5 py-5 border-b border-slate-700/60">
              <div className="font-extrabold tracking-wide">🏛️ SIGAP-MALUT</div>
              <div className="text-xs text-slate-300 mt-1">
                {isPerencana ? "JF Perencanaan" : "JF Keuangan / PPK"}
              </div>
            </div>
            <nav className="px-3 py-3 space-y-1">
              {sidebarItems.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setSekMenu(it.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-slate-800 transition ${
                    sekMenu === it.id ? "bg-slate-800" : ""
                  }`}
                >
                  <span className="truncate">{it.label}</span>
                  {typeof it.badge === "number" ? (
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        it.badge > 0 ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-200"
                      }`}
                    >
                      {it.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <header className="bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-500">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-lg font-bold text-slate-800 truncate">
                    {isPerencana ? "Dashboard JF Perencanaan" : "Dashboard JF Keuangan / PPK"} ·{" "}
                    {user?.nama_lengkap || user?.name || user?.username || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={refreshSummary}
                    className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    ↺ Refresh
                  </button>
                  <BukaEPelaraButton
                    label="Buka e-Pelara"
                    targetPath="/"
                    className="!py-2 !px-3 !text-xs"
                  />
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
              {/* Hero KPI tiles */}
              <div className={`grid grid-cols-2 ${isPerencana ? "md:grid-cols-5" : "md:grid-cols-6"} gap-3`}>
                {tiles.map((t) => (
                  <div
                    key={t.label}
                    className={`rounded-xl border p-4 ${t.tone}`}
                  >
                    <div className="text-2xl font-extrabold">{t.value}</div>
                    <div className="text-xs font-semibold mt-1">{t.label}</div>
                  </div>
                ))}
              </div>

              {sekMenu === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-2">📌 Ringkas</div>
                    <div className="text-sm text-slate-600">
                      Mode ini khusus JF Sekretariat:{" "}
                      <span className="font-semibold">
                        {isPerencana ? "Perencanaan" : "Keuangan/PPK"}
                      </span>
                      . Tidak ada panel “Assign ke bawahan” dan tidak ada penilaian kinerja orang lain.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSekMenu("inbox")}
                        className="text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Buka Inbox Sekretaris
                      </button>
                      <button
                        onClick={() => setSekMenu("hasil")}
                        className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        Riwayat Analisa Saya
                      </button>
                      {isPerencana ? (
                        <button
                          onClick={() => setSekMenu("workspace")}
                          className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          Workspace Analisa
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-2">🔗 Cascading Check</div>
                    <div className="text-sm text-slate-600">
                      Ambil ringkasan cascading dari e-Pelara untuk konteks analisa.
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => setSekMenu("epelara")}
                        className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        Buka Referensi e-Pelara
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {sekMenu === "ppk" && isKeuanganPpk && (
                <PpkQueuePanel baseUrl={sekBase} onAfterAction={refreshSummary} />
              )}

              {sekMenu === "inbox" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-slate-800">📥 Inbox Sekretaris</div>
                    <button
                      onClick={() => setSekMenu("overview")}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ← Kembali
                    </button>
                  </div>
                  {sekInboxLoading ? (
                    <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                  ) : sekInbox.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">Inbox kosong.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr>
                            <th className="px-3 py-2 text-left">Judul</th>
                            <th className="px-3 py-2 text-left">Prioritas</th>
                            <th className="px-3 py-2 text-left">Deadline</th>
                            <th className="px-3 py-2 text-left">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sekInbox.map((t) => (
                            <tr key={t.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-medium">{t.title}</td>
                              <td className="px-3 py-2">{t.priority ?? "—"}</td>
                              <td className="px-3 py-2">
                                {t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID") : "—"}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => handleKonfirmasiTerima(t.id)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Konfirmasi Terima
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {sekMenu === "workspace" && isPerencana && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="font-bold text-slate-800 mb-3">🧩 Workspace Analisa (MVP)</div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-slate-500 mb-2">FORM ANALISA</div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-500">Judul</label>
                          <input
                            value={draft.judul}
                            onChange={(e) => setDraft((d) => ({ ...d, judul: e.target.value }))}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Contoh: Draft Renja 2027 — Kompilasi OPD"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-slate-500">Jenis Analisa</label>
                            <select
                              value={draft.jenis_analisa}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, jenis_analisa: e.target.value }))
                              }
                              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            >
                              <option value="analisa_renstra">Analisa Renstra</option>
                              <option value="analisa_renja">Analisa Renja</option>
                              <option value="analisa_rka">Analisa RKA</option>
                              <option value="monev_triwulan">Monev Triwulan</option>
                              <option value="analisa_lakip">Analisa LAKIP</option>
                              <option value="verifikasi_cascading">Verifikasi Cascading</option>
                              <option value="lainnya">Lainnya</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">Tujuan Submit</label>
                            <select
                              value={draft.tujuan_submit}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, tujuan_submit: e.target.value }))
                              }
                              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            >
                              <option value="sekretaris">Sekretaris</option>
                              <option value="kasubag">Kasubag</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Catatan Teknis</label>
                          <textarea
                            value={draft.catatan_teknis}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, catatan_teknis: e.target.value }))
                            }
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-24"
                            placeholder="Tuliskan analisa naratif..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Rekomendasi</label>
                          <textarea
                            value={draft.rekomendasi}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, rekomendasi: e.target.value }))
                            }
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-20"
                            placeholder="Rekomendasi tindakan..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreateDraft}
                            disabled={!draft.judul || !draft.jenis_analisa}
                            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-50"
                          >
                            Simpan Draft
                          </button>
                          <button
                            onClick={() => setSekMenu("hasil")}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          >
                            Buka Riwayat
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-slate-500 mb-2">REFERENSI (e-Pelara)</div>
                      <div className="space-y-2">
                        <button
                          onClick={() => window.open("/dashboard/fungsional", "_self")}
                          className="hidden"
                        />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSekMenu("epelara");
                          }}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Buka panel referensi e-Pelara →
                        </a>
                        <div className="text-xs text-slate-500">
                          Di panel referensi, Anda bisa melihat ringkasan RPJMD/Renstra/Monev yang diproxy dari e-Pelara.
                        </div>
                        {activeAnalisa ? (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="text-xs font-semibold text-slate-600">Draft aktif</div>
                            <div className="text-sm font-bold text-slate-800 mt-1">
                              {activeAnalisa.judul}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Status: {activeAnalisa.status} · Tujuan: {activeAnalisa.tujuan_submit}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleSubmitAnalisa(activeAnalisa, activeAnalisa.tujuan_submit)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Submit sesuai Tujuan
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sekMenu === "hasil" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-slate-800">📤 Hasil Analisa Saya</div>
                    {isPerencana ? (
                      <button
                        onClick={() => setSekMenu("workspace")}
                        className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        + Draft baru
                      </button>
                    ) : null}
                  </div>
                  {sekAnalisaLoading ? (
                    <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                  ) : sekAnalisa.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">Belum ada analisa.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr>
                            <th className="px-3 py-2 text-left">Nomor</th>
                            <th className="px-3 py-2 text-left">Judul</th>
                            <th className="px-3 py-2 text-left">Jenis</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sekAnalisa.map((a) => (
                            <tr key={a.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-mono text-xs text-slate-600">
                                {a.nomor_analisa || `#${a.id}`}
                              </td>
                              <td className="px-3 py-2 font-medium">{a.judul}</td>
                              <td className="px-3 py-2">{a.jenis_analisa}</td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => setActiveAnalisa(a)}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                                  >
                                    Pilih
                                  </button>
                                  {a.status === "draft" ? (
                                    <button
                                      onClick={() => handleSubmitAnalisa(a, a.tujuan_submit || "sekretaris")}
                                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                      Submit
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {sekMenu === "dikembalikan" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="font-bold text-slate-800 mb-4">↩️ Dikembalikan</div>
                  {sekDikembalikanLoading ? (
                    <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                  ) : sekDikembalikan.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">Tidak ada yang dikembalikan.</div>
                  ) : (
                    <div className="space-y-3">
                      {sekDikembalikan.map((a) => (
                        <div
                          key={a.id}
                          className="border border-rose-200 bg-rose-50 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-rose-900 truncate">
                                {a.judul}
                              </div>
                              <div className="text-xs text-rose-800 mt-1">
                                Status: {a.status} · Revisi ke-{a.revisi_ke || 0}
                              </div>
                              {a.catatan_sekretaris ? (
                                <div className="text-sm text-rose-900 mt-2 whitespace-pre-wrap">
                                  {a.catatan_sekretaris}
                                </div>
                              ) : a.catatan_kasubag ? (
                                <div className="text-sm text-rose-900 mt-2 whitespace-pre-wrap">
                                  {a.catatan_kasubag}
                                </div>
                              ) : null}
                            </div>
                            <div className="shrink-0">
                              <button
                                onClick={() => handleSubmitRevisi(a)}
                                className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                              >
                                Perbaiki & Submit Ulang
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {sekMenu === "epelara" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-3">🗺️ RPJMD / Visi-Misi</div>
                    <EpelaraBox endpoint="/api/epelara/visi-misi" />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-3">🔗 Cascading</div>
                    <EpelaraBox endpoint="/api/epelara/cascading" />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-3">📄 Renstra OPD</div>
                    <EpelaraBox endpoint="/api/epelara/renstra-opd" />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-800 mb-3">📊 Monev</div>
                    <EpelaraBox endpoint="/api/epelara/monev" />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900/95 to-slate-900/80 border-2 border-indigo-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🎓</span>
          Dashboard Jabatan Fungsional
        </h1>
        <p className="text-indigo-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "—"}
          </span>
          {" · "}Role e-Pelara:{" "}
          <span
            className={`font-bold ${epelараRole === "ADMINISTRATOR" ? "text-green-300" : "text-amber-300"}`}
          >
            {epelараRole}
          </span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tugas Aktif",
            value: loading ? "…" : tugas.length,
            color: "indigo",
          },
          { label: "Verifikasi Teknis", value: verifCount == null ? "…" : verifCount, color: "blue" },
          { label: "Analisis Selesai", value: "—", color: "emerald" },
          { label: "Permintaan Revisi", value: "—", color: "amber" },
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

      {/* Daftar Tugas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Tugas Ditugaskan ke Saya
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tugas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas yang ditugaskan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Modul</th>
                </tr>
              </thead>
              <tbody>
                {tugas.map((t, i) => (
                  <tr
                    key={t.id ?? i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium">
                      {t.judul || t.title || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                        {t.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {t.modul_id || t.modulId || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renstra Sub-Kegiatan Saya — hanya untuk JF Bidang (D-10) */}
      {isBidang && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              📄 Renstra Sub-Kegiatan Saya
            </h2>
            <BukaEPelaraButton
              label="Input / Edit →"
              targetPath="/dashboard-renstra"
              className="!py-1.5 !px-3 !text-xs"
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Sub-kegiatan yang menjadi tanggung jawab teknis Anda untuk
            diisi/diverifikasi di e-Pelara.
          </p>
          <div className="flex flex-wrap gap-2">
            <BukaEPelaraButton
              label="Form Input Target & Indikator"
              targetPath="/dashboard-renstra"
              className="!py-2 !px-3 !text-xs"
            />
            <BukaEPelaraButton
              label="Draft Renja Bidang"
              targetPath="/dashboard-renja"
              className="!py-2 !px-3 !text-xs"
            />
            <BukaEPelaraButton
              label="Cascading Check"
              targetPath="/dashboard-renstra"
              className="!py-2 !px-3 !text-xs"
            />
          </div>
        </div>
      )}

      {/* Workspace analisa/verifikasi — Bidang vs UPTD */}
      {(isBidang || isUptd) && workspaceAnalisa}

      {/* Coverage harian harga — JF Distribusi */}
      {isBidang && unit.includes("distribusi") && cov && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <span className="font-semibold">📊 Coverage input harga hari ini:</span>{" "}
          {cov.sudah}/{cov.total} pasar · Batas {cov.deadline_wit} WIT
          {cov.belum_nama?.length ? (
            <span className="block text-xs mt-1 text-amber-800">
              Belum: {cov.belum_nama.join(" · ")}
            </span>
          ) : null}
        </div>
      )}

      {/* Verifikasi data dari Pelaksana — Ketersediaan vs Distribusi */}
      {isBidang && unit.includes("ketersediaan") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JfVerifikasiDataMasukPanel
            baseUrl="/api/jf-ketersediaan"
            title="Verifikasi Data Produksi / Lapangan"
            unitBadge="JF Bidang Ketersediaan"
          />
          <TimPelaksanaPanel baseUrl="/api/jf-ketersediaan" />
        </div>
      )}
      {isBidang && unit.includes("distribusi") && (
        <JfVerifikasiDataMasukPanel
          baseUrl="/api/jf-distribusi"
          title="Verifikasi Harga Pasar Harian"
          unitBadge="JF Bidang Distribusi"
          actionOk="terima"
          actionReturn="kembalikan"
        />
      )}
      {isBidang && unit.includes("konsumsi") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JfVerifikasiDataMasukPanel
            baseUrl="/api/jf-konsumsi"
            title="Verifikasi Data Konsumsi / Inspeksi / SPPG"
            unitBadge="JF Bidang Konsumsi"
            subTypeOptions={[
              { id: "survei", label: "Survei Konsumsi (PPH)" },
              { id: "sppg", label: "Realisasi SPPG" },
              { id: "inspeksi", label: "Laporan Inspeksi" },
            ]}
            queryParamName="type"
            actionOk="ok"
            actionReturn="kembalikan"
          />
          <TimPelaksanaPanel baseUrl="/api/jf-konsumsi" />
        </div>
      )}

      {/* ─── PANEL STATUS REVIEW ATASAN — Priority 2 ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📬 Status Review Atasan
          </h2>
          <BukaEPelaraButton
            label="Lihat Semua →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Status dokumen yang sudah Anda ajukan — apakah sudah diverifikasi
          Sekretaris atau disetujui Kepala Dinas.
        </p>
        {reviewLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat status review…
          </p>
        ) : reviewData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada dokumen yang diajukan dari unit Anda.
          </p>
        ) : (
          <div className="space-y-2">
            {reviewData.map((dok, i) => {
              const st = dok.status ?? "draft";
              const stepsMap = [
                "draft",
                "diajukan",
                "diverifikasi",
                "disetujui",
              ];
              const stepIdx = stepsMap.indexOf(st);
              const stepColors = [
                "bg-gray-300 text-gray-600",
                "bg-amber-400 text-white",
                "bg-blue-500 text-white",
                "bg-green-500 text-white",
              ];
              return (
                <div
                  key={dok.id ?? i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {dok.judul ?? dok.jenis_dokumen ?? `Dokumen #${i + 1}`}
                    </p>
                    <p className="text-xs text-gray-400">{dok.tahun ?? "—"}</p>
                  </div>
                  {/* Progress steps horizontal */}
                  <div className="flex items-center gap-1 shrink-0">
                    {stepsMap.map((step, si) => (
                      <div key={step} className="flex items-center gap-1">
                        <span
                          className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                            si <= stepIdx
                              ? (stepColors[si] ?? "bg-green-500 text-white")
                              : "bg-gray-200 text-gray-400"
                          }`}
                          title={step}
                        >
                          {si + 1}
                        </span>
                        {si < stepsMap.length - 1 && (
                          <div
                            className={`w-4 h-0.5 ${si < stepIdx ? "bg-green-400" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    ))}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        stepIdx === -1 || st === "ditolak"
                          ? "bg-red-100 text-red-700"
                          : st === "disetujui"
                            ? "bg-green-100 text-green-700"
                            : st === "diverifikasi"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Cascading Check ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🔗 Cascading Check Perencanaan
        </h2>
        {cascadeLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data cascading…
          </p>
        ) : (
          <div className="space-y-2">
            {(() => {
              const tujuanArr = Array.isArray(cascadeData?.tujuan)
                ? cascadeData.tujuan
                : [];
              const sasaranArr = Array.isArray(cascadeData?.sasaran)
                ? cascadeData.sasaran
                : [];
              const renstraArr = Array.isArray(cascadeData?.renstraOpd)
                ? cascadeData.renstraOpd
                : [];
              const renstraDisetujui = renstraArr.filter(
                (d) => d.status === "disetujui",
              ).length;
              const steps = [
                {
                  label: "Tujuan Renstra",
                  ok: tujuanArr.length > 0,
                  detail: `${tujuanArr.length} tujuan`,
                },
                {
                  label: "Sasaran Strategis",
                  ok: sasaranArr.length > 0,
                  detail: `${sasaranArr.length} sasaran`,
                },
                {
                  label: "Renstra OPD disetujui",
                  ok: renstraDisetujui > 0,
                  detail: `${renstraDisetujui}/${renstraArr.length} disetujui`,
                },
                {
                  label: "Renja/DPA ter-cascade",
                  ok: renstraArr.length >= 2,
                  detail:
                    renstraArr.length >= 2
                      ? "Terindikasi cukup"
                      : "Belum cukup data",
                },
              ];
              const allOk = steps.every((s) => s.ok);
              return (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                          step.ok
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                      >
                        <span className="text-base">
                          {step.ok ? "✅" : "❌"}
                        </span>
                        <div>
                          <div className="font-semibold">{step.label}</div>
                          <div className="text-gray-500">{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                    <span
                      className={`text-xs font-semibold ${allOk ? "text-green-600" : "text-amber-600"}`}
                    >
                      {allOk
                        ? "✅ Cascading chain: Lengkap"
                        : "⚠️ Ada rantai yang belum terpenuhi"}
                    </span>
                    <button
                      onClick={() => {
                        setCascadeLoading(true);
                        api
                          .get("/api/epelara/cascading")
                          .then((r) => setCascadeData(r.data ?? null))
                          .catch(() => setCascadeData(null))
                          .finally(() => setCascadeLoading(false));
                      }}
                      className="text-xs text-gray-400 hover:text-indigo-500 transition"
                    >
                      ↺ Refresh
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">Akses e-Pelara</h2>{" "}
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>{epelараRole}</strong> — Anda dapat{" "}
          {epelараRole === "ADMINISTRATOR"
            ? "memverifikasi dan menyetujui dokumen perencanaan bidang."
            : "memantau progres dokumen perencanaan (view-only)."}
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

function EpelaraBox({ endpoint }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let mounted = true;
    setState({ loading: true, data: null, error: null });
    api
      .get(endpoint, { params: { limit: 10 } })
      .then((r) => {
        if (!mounted) return;
        setState({ loading: false, data: r.data?.data ?? r.data ?? null, error: null });
      })
      .catch((e) => {
        if (!mounted) return;
        setState({ loading: false, data: null, error: e?.message || "Gagal fetch" });
      });
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  if (state.loading) return <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>;
  if (state.error) return <div className="text-sm text-rose-600">{state.error}</div>;
  return (
    <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-64">
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}

function PpkQueuePanel({ baseUrl, onAfterAction }) {
  const [tab, setTab] = useState("pengeluaran");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRows(activeTab) {
    setLoading(true);
    try {
      const r = await api.get(`${baseUrl}/ppk-queue`, {
        params: { jenis: activeTab, limit: 30 },
      });
      setRows(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!baseUrl) return;
    fetchRows(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, tab]);

  async function aksiTerima(spj) {
    await api.post(`${baseUrl}/ppk-queue/${spj.id}/terima`, {
      catatan_ppk: "",
    });
    await fetchRows(tab);
    onAfterAction?.();
  }

  async function aksiKembalikan(spj) {
    const note = window.prompt("Catatan teknis PPK (wajib).");
    if (!note) return;
    await api.post(`${baseUrl}/ppk-queue/${spj.id}/kembalikan`, {
      catatan_ppk: note,
    });
    await fetchRows(tab);
    onAfterAction?.();
  }

  async function aksiTolak(spj) {
    const dasar = window.prompt(
      "Dasar hukum penolakan (wajib). Contoh: 'Permenkeu ... pasal ...'",
    );
    if (!dasar) return;
    const note = window.prompt("Catatan tambahan (opsional).") || "";
    await api.post(`${baseUrl}/ppk-queue/${spj.id}/tolak`, {
      dasar_hukum_tolak: dasar,
      catatan_ppk: note,
    });
    await fetchRows(tab);
    onAfterAction?.();
  }

  const tabs = [
    { id: "pengeluaran", label: "SPJ Pengeluaran" },
    { id: "gaji", label: "Belanja Pegawai" },
    { id: "barang", label: "Pengadaan & BMD" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="font-bold text-slate-800">🔍 Verifikasi PPK Queue</div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-2 rounded-lg border ${
                tab === t.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-slate-500 italic">Antrean kosong.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Nomor</th>
                <th className="px-3 py-2 text-left">Kode Rekening</th>
                <th className="px-3 py-2 text-right">Nominal</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((spj) => (
                <tr key={spj.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {spj.nomor_spj || `SPJ#${spj.id}`}
                  </td>
                  <td className="px-3 py-2">{spj.kode_rekening}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(spj.nominal || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                      {spj.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => aksiTerima(spj)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Terima (OK)
                      </button>
                      <button
                        onClick={() => aksiKembalikan(spj)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Kembalikan
                      </button>
                      <button
                        onClick={() => aksiTolak(spj)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Tolak (Hukum)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
