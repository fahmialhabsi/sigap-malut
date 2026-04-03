import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import ExecutiveHorizontalCoordinationPanel from "../../components/coordination/ExecutiveHorizontalCoordinationPanel.jsx";
import ExecutiveFormModal from "../../components/executive/ExecutiveFormModal.jsx";
import useAuthStore from "../../stores/authStore";
import KadinExecutiveTimeline from "../../components/kadin/KadinExecutiveTimeline.jsx";
import ClarificationThreadPanel, {
  ANCHOR,
  LANES,
} from "../../components/clarification/ClarificationThreadPanel.jsx";
import { roleIdToName } from "../../utils/roleMap";
import { executiveTheme } from "./executiveTheme";
import ExecutionThreadObservabilityPanel from "../../components/execution/ExecutionThreadObservabilityPanel.jsx";
import CrossThreadSystemicPanel from "../../components/execution/CrossThreadSystemicPanel.jsx";

const JENIS_PERLU_PIN_KADIN = new Set(["persetujuan_anggaran"]);
const MENU_ITEMS = [
  { k: "overview", label: "Dashboard" },
  { k: "inbox", label: "Inbox Gubernur" },
  {
    k: "pengajuan_gub",
    label: "Pengajuan ke Gubernur",
  },
  { k: "buat_perintah", label: "Buat Perintah ke Bawahan" },
  { k: "perintah", label: "Perintah Saya" },
  {
    k: "approval",
    label: "Antrean internal dinas",
  },
  { k: "kinerja", label: "Monitor Kinerja" },
  { k: "diskusi", label: "Diskusi & tanya jawab" },
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

function Tile({ label, value, hint }) {
  return (
    <div className={executiveTheme.tile}>
      <div className={executiveTheme.tileAccent} aria-hidden />
      <div className={executiveTheme.tileLabel}>{label}</div>
      <div className={executiveTheme.tileValue}>{value ?? "-"}</div>
      {hint ? <div className={executiveTheme.tileHint}>{hint}</div> : null}
    </div>
  );
}

function PanelHeader({ title, subtitle, right }) {
  return (
    <div className={executiveTheme.panelHeader}>
      <div>
        <div className={executiveTheme.panelTitle}>{title}</div>
        {subtitle ? (
          <div className={executiveTheme.panelSubtitle}>{subtitle}</div>
        ) : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className={executiveTheme.mutedText}>{text}</div>;
}

export default function DashboardKepalaDinas() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const allowed = ["kepala_dinas", "super_admin"];
  const isAllowed = !!(user && allowed.includes(roleName));

  const [menu, setMenu] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [perintah, setPerintah] = useState([]);
  const [approval, setApproval] = useState([]);
  const [kinerja, setKinerja] = useState([]);

  const [formPerintah, setFormPerintah] = useState({
    title: "",
    description: "",
    assignee_role: "sekretaris",
    assignee_user_id: "",
    due_date: "",
    priority: 3,
  });
  /** Jika diisi, Kirim Perintah menyertakan metadata turunan instruksi Gubernur (untuk selesai otomatis). */
  const [linkedInstruksiId, setLinkedInstruksiId] = useState(null);
  const [diskusiInstruksiId, setDiskusiInstruksiId] = useState(null);
  const [diskusiTaskId, setDiskusiTaskId] = useState("");

  const [pengajuanGub, setPengajuanGub] = useState([]);
  const [kadisCockpit, setKadisCockpit] = useState(null);
  const [formPengGub, setFormPengGub] = useState({
    judul: "",
    jenis: "laporan_strategis",
    isi_pengajuan: "",
    lampiran_url: "",
    instruksi_id: "",
  });

  const [modalLapor, setModalLapor] = useState(null);
  const [teksLaporan, setTeksLaporan] = useState("");

  const [modalApproval, setModalApproval] = useState(null);
  const [teksApprovalCatatan, setTeksApprovalCatatan] = useState("");
  const [teksApprovalPin, setTeksApprovalPin] = useState("");

  function applyInstruksiKeForm(item) {
    if (!item) return;
    const deadline =
      item.deadline != null && item.deadline !== ""
        ? String(item.deadline).slice(0, 10)
        : "";
    setFormPerintah((prev) => ({
      ...prev,
      title: item.judul || prev.title,
      description: item.isi_perintah || prev.description,
      due_date: deadline || prev.due_date,
    }));
    setLinkedInstruksiId(item.id);
  }

  function clearLinkedInstruksi() {
    setLinkedInstruksiId(null);
  }

  const refreshKadinCockpit = useCallback(async () => {
    try {
      const r = await api.get("/kadin/dashboard/cockpit");
      setKadisCockpit(r.data?.data || null);
    } catch {
      /* biarkan data lama */
    }
  }, []);

  async function refreshAll() {
    setLoading(true);
    try {
      const [a, b, c, d, e, pg, ck] = await Promise.all([
        api.get("/kadin/dashboard/summary"),
        api.get("/kadin/inbox-gubernur?limit=25"),
        api.get("/kadin/perintah?limit=25"),
        api.get("/kadin/approval?limit=25"),
        api.get("/kadin/kinerja/bawahan"),
        api.get("/kadin/pengajuan-gubernur").catch(() => ({ data: {} })),
        api.get("/kadin/dashboard/cockpit").catch(() => ({ data: {} })),
      ]);
      setKadisCockpit(ck.data?.data || null);
      setSummary(a.data?.data || null);
      setInbox(b.data?.data || []);
      setPerintah(c.data?.data || []);
      setApproval(d.data?.data || []);
      setKinerja(e.data?.data || []);
      setPengajuanGub(pg.data?.data || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal memuat dashboard Kepala Dinas",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAllowed) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed]);

  useEffect(() => {
    if (!isAllowed) return;
    const t = setInterval(() => {
      void refreshKadinCockpit();
    }, 90000);
    return () => clearInterval(t);
  }, [isAllowed, refreshKadinCockpit]);

  const tiles = useMemo(() => {
    const s = summary || {};
    return [
      {
        label: "Inbox Gubernur",
        value: s.inbox_gubernur ?? "-",
        hint: "Instruksi baru yang sudah diterbitkan.",
      },
      {
        label: "Perintah Aktif",
        value: s.perintah_aktif ?? "-",
        hint: "Tugas berjalan ke lima bawahan langsung.",
      },
      {
        label: "Antrean internal",
        value: s.approval_queue ?? "-",
        hint: "Pengajuan internal setelah validasi Sekretaris (bukan ke Gubernur).",
      },
      {
        label: "SLA",
        value: typeof s.sla_persen === "number" ? `${s.sla_persen}%` : "-",
        hint: "Indikator layanan agregat tahap MVP.",
      },
      {
        label: "Alert Kritis",
        value: s.alert_kritis ?? "-",
        hint: "Butuh perhatian cepat dari pimpinan.",
      },
    ];
  }, [summary]);

  async function konfirmasiInstruksi(id) {
    try {
      await api.post(`/kadin/inbox-gubernur/${id}/konfirmasi`);
      toast.success("Instruksi dikonfirmasi");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal konfirmasi");
    }
  }

  function bukaLaporSelesai(id) {
    setModalLapor(id);
    setTeksLaporan("");
  }

  async function kirimLaporSelesai() {
    if (!modalLapor) return;
    try {
      await api.post(`/kadin/inbox-gubernur/${modalLapor}/lapor-selesai`, {
        laporan_pelaksanaan: teksLaporan.trim() || undefined,
      });
      toast.success("Instruksi ditandai selesai");
      setModalLapor(null);
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal lapor selesai");
    }
  }

  async function kirimPengajuanKeGubernur() {
    try {
      if (
        !formPengGub.judul.trim() ||
        !formPengGub.isi_pengajuan.trim()
      ) {
        toast.error("Judul dan isi pengajuan wajib diisi.");
        return;
      }
      await api.post("/kadin/pengajuan-gubernur", {
        judul: formPengGub.judul.trim(),
        jenis: formPengGub.jenis,
        isi_pengajuan: formPengGub.isi_pengajuan.trim(),
        lampiran_url: formPengGub.lampiran_url.trim() || null,
        instruksi_id: formPengGub.instruksi_id
          ? Number(formPengGub.instruksi_id)
          : null,
      });
      toast.success("Pengajuan terkirim ke Gubernur");
      setFormPengGub({
        judul: "",
        jenis: "laporan_strategis",
        isi_pengajuan: "",
        lampiran_url: "",
        instruksi_id: "",
      });
      refreshAll();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal mengirim pengajuan",
      );
    }
  }

  async function buatPerintah() {
    try {
      if (!formPerintah.title || !formPerintah.assignee_role) {
        toast.error("Lengkapi minimal judul dan penerima.");
        return;
      }
      await api.post("/kadin/perintah", {
        title: formPerintah.title,
        description: formPerintah.description,
        assignee_role: formPerintah.assignee_role,
        assignee_user_id: formPerintah.assignee_user_id
          ? Number(formPerintah.assignee_user_id)
          : null,
        due_date: formPerintah.due_date || null,
        priority: Number(formPerintah.priority || 3),
        ...(linkedInstruksiId
          ? { sumber_instruksi_gubernur_id: linkedInstruksiId }
          : {}),
      });
      toast.success("Perintah dikirim");
      setFormPerintah({
        title: "",
        description: "",
        assignee_role: "sekretaris",
        assignee_user_id: "",
        due_date: "",
        priority: 3,
      });
      setLinkedInstruksiId(null);
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal membuat perintah");
    }
  }

  function bukaModalApproval(id, keputusan, jenis) {
    const perluPin = JENIS_PERLU_PIN_KADIN.has(String(jenis || ""));
    if (keputusan === "setuju" && !perluPin) {
      void eksekusiApproval(id, keputusan, jenis, "", "");
      return;
    }
    setModalApproval({ id, keputusan, jenis });
    setTeksApprovalCatatan("");
    setTeksApprovalPin("");
  }

  async function eksekusiApproval(id, keputusan, jenis, catatan, pin) {
    try {
      const perluPin = JENIS_PERLU_PIN_KADIN.has(String(jenis || ""));
      if (perluPin && keputusan === "setuju" && !String(pin || "").trim()) {
        toast.error("PIN wajib untuk jenis persetujuan anggaran.");
        return;
      }
      if (
        (keputusan === "tolak" || keputusan === "kembalikan") &&
        !String(catatan || "").trim()
      ) {
        toast.error("Catatan wajib untuk tolak atau kembalikan.");
        return;
      }
      await api.post(`/kadin/approval/${id}/putuskan`, {
        ...(perluPin && keputusan === "setuju" ? { pin: String(pin).trim() } : {}),
        keputusan,
        catatan: String(catatan || "").trim(),
      });
      toast.success("Keputusan tersimpan");
      setModalApproval(null);
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memutuskan approval");
    }
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-rose-500/25 bg-slate-900/95 p-6 text-center text-slate-100 shadow-[0_24px_48px_-28px_rgba(2,6,23,0.85)]">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">
          Akses Terbatas
        </div>
        <div className="mb-2 text-lg font-bold text-white">Akses ditolak.</div>
        <div className="text-sm text-slate-300">
          Dashboard ini hanya untuk Kepala Dinas.
        </div>
      </div>
    );
  }

  return (
    <div className={executiveTheme.shell}>
      <div className={executiveTheme.shellGlowLeft} aria-hidden />
      <div className={executiveTheme.shellGlowRight} aria-hidden />
      <div className={executiveTheme.shellGlowBottom} aria-hidden />

      <div className={executiveTheme.content}>
        <div className={`${executiveTheme.hero} mb-6`}>
          <div className={executiveTheme.heroAccent} aria-hidden />
          <div className={executiveTheme.heroGlow} aria-hidden />

          <div className={executiveTheme.heroInner}>
            <div>
              <div className={executiveTheme.heroKicker}>Executive Command</div>
              <div className={executiveTheme.heroTitle}>Kepala Dinas</div>
              <div className={executiveTheme.heroMeta}>
                Kendali instruksi, approval, dan pengawasan kinerja unit
              </div>
              <div className={executiveTheme.heroDescription}>
                Pantau arahan Gubernur, distribusi tugas, antrean persetujuan,
                dan ringkasan performa unit dalam satu tampilan eksekutif yang
                lebih tenang, padat, dan profesional.
              </div>
            </div>

            <div className={executiveTheme.heroLoginCard}>
              <div className={executiveTheme.heroLoginLabel}>Login Sebagai</div>
              <div className={executiveTheme.heroLoginValue}>
                {user?.nama_lengkap || user?.username || "Kepala Dinas"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
          <aside className={executiveTheme.sidebar}>
            <div className={executiveTheme.sidebarTitle}>
              Navigasi Eksekutif
            </div>
            <div className="space-y-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.k}
                  type="button"
                  onClick={() => setMenu(item.k)}
                  className={`${executiveTheme.menuButtonBase} ${
                    menu === item.k
                      ? executiveTheme.menuButtonActive
                      : executiveTheme.menuButtonIdle
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          menu === item.k ? "bg-amber-300" : "bg-slate-600"
                        }`}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className={`text-[10px] ${
                        menu === item.k ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {menu === item.k ? "Aktif" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className={executiveTheme.sidebarNote}>
              <div className={executiveTheme.sidebarNoteTitle}>
                Fokus Hari Ini
              </div>
              <div className={executiveTheme.sidebarNoteText}>
                Pengendalian komando lintas unit
              </div>
              <div className={executiveTheme.sidebarNoteCaption}>
                Gunakan menu untuk berpindah cepat antara inbox, approval, dan
                pemantauan kinerja bawahan tanpa mengubah alur kerja yang ada.
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {tiles.map((tile) => (
                <Tile
                  key={tile.label}
                  label={tile.label}
                  value={tile.value}
                  hint={tile.hint}
                />
              ))}
            </div>

            {menu === "overview" && kadisCockpit ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Prioritas dari Gubernur"
                  subtitle="Instruksi paling urgent, batas waktu dekat, skor Anda, dan pengajuan yang dikembalikan."
                  right={
                    <button
                      type="button"
                      onClick={refreshAll}
                      className={executiveTheme.buttonSecondary}
                    >
                      Refresh
                    </button>
                  }
                />
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Instruksi prioritas
                    </div>
                    {kadisCockpit.prioritas_instruksi_gubernur?.length ? (
                      <ul className="mt-3 space-y-2 text-sm">
                        {kadisCockpit.prioritas_instruksi_gubernur
                          .slice(0, 4)
                          .map((x) => (
                            <li
                              key={x.id}
                              className="rounded-xl border border-slate-800/80 px-3 py-2"
                            >
                              <span className="font-medium text-slate-100">
                                {x.nomor_instruksi || `#${x.id}`}
                              </span>
                              <span className="text-slate-500"> · </span>
                              <span className="text-slate-300">{x.judul}</span>
                              <div className="mt-1 text-[11px] text-slate-500">
                                {x.prioritas} · {x.status}
                                {x.deadline ? ` · batas ${x.deadline}` : ""}
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <EmptyState text="Tidak ada instruksi terbuka." />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">
                        Mendekati batas waktu
                      </div>
                      {kadisCockpit.instruksi_mendekati_deadline?.length ? (
                        <ul className="mt-2 space-y-1 text-xs text-amber-50/95">
                          {kadisCockpit.instruksi_mendekati_deadline.map((x) => (
                            <li key={x.id}>
                              {x.nomor_instruksi || `#${x.id}`} — batas{" "}
                              {x.deadline}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-xs text-slate-500">
                          Tidak ada yang jatuh tempo dalam 3 hari.
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Performa Anda (90 hari)
                      </div>
                      <div className="mt-2 text-3xl font-extrabold text-white tabular-nums">
                        {kadisCockpit.performa_skor_90_hari != null
                          ? `${kadisCockpit.performa_skor_90_hari}%`
                          : "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {kadisCockpit.performa_label}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-200/90">
                        Pengajuan dikembalikan
                      </div>
                      {kadisCockpit.pengajuan_dikembalikan?.length ? (
                        <ul className="mt-2 space-y-2 text-xs text-rose-50/95">
                          {kadisCockpit.pengajuan_dikembalikan.map((p) => (
                            <li key={p.id}>
                              <span className="font-semibold">
                                {p.nomor_pengajuan}
                              </span>
                              : {p.judul}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-xs text-slate-500">
                          Tidak ada pengajuan yang dikembalikan.
                        </div>
                      )}
                    </div>
                  </div>
                  {kadisCockpit.execution_threads?.recent_threads?.length ? (
                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-4 lg:col-span-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/90">
                        Thread eksekusi (bawahan &amp; rantai)
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>
                          Thread terlacak:{" "}
                          <strong className="text-slate-200">
                            {kadisCockpit.execution_threads.threads_tracked ??
                              "—"}
                          </strong>
                        </span>
                        <span>
                          Rantai aktif:{" "}
                          <strong className="text-slate-200">
                            {kadisCockpit.execution_threads
                              .rantai_aktif_gabungan ?? "—"}
                          </strong>
                        </span>
                      </div>
                      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-xs">
                        {kadisCockpit.execution_threads.recent_threads.map(
                          (row) => (
                            <li
                              key={row.execution_thread_id}
                              className="rounded-lg border border-slate-800/80 px-2 py-1.5"
                            >
                              <Link
                                to={`/dashboard/execution-thread/${encodeURIComponent(row.execution_thread_id)}`}
                                className="font-medium text-cyan-200 hover:underline"
                              >
                                {row.judul}
                              </Link>
                              <div className="font-mono text-[10px] text-slate-500">
                                {row.execution_thread_id}
                              </div>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {menu === "overview" ? (
              <div className="mb-4 space-y-4">
                <ExecutiveHorizontalCoordinationPanel subtitle="Pantau hambatan koordinasi antar unit administrator." />
                <CrossThreadSystemicPanel />
                <ExecutionThreadObservabilityPanel title="Thread eksekusi bawah Kepala Dinas" />
              </div>
            ) : null}

            {(menu === "overview" || menu === "perintah") && (
              <KadinExecutiveTimeline
                inbox={menu === "overview" ? inbox : []}
                perintah={perintah}
                loading={loading}
              />
            )}

            {menu === "overview" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Inbox Gubernur"
                  subtitle="Ringkasan instruksi terbaru yang memerlukan tindak lanjut. Gunakan tab « Buat Perintah ke Bawahan » untuk mendistribusikan tugas."
                  right={
                    <button
                      onClick={refreshAll}
                      className={executiveTheme.buttonSecondary}
                    >
                      Refresh
                    </button>
                  }
                />

                <div className="space-y-3 p-4">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : inbox.length === 0 ? (
                    <EmptyState text="Tidak ada instruksi." />
                  ) : (
                    inbox.slice(0, 6).map((item) => (
                      <div key={item.id} className={executiveTheme.itemCard}>
                        <div className="text-sm font-semibold text-slate-100">
                          {item.nomor_instruksi || `#${item.id}`} -{" "}
                          {item.judul}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Jenis: {item.jenis} | Prioritas: {item.prioritas} |
                          Status:{" "}
                          <span className="font-medium text-slate-100">
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => konfirmasiInstruksi(item.id)}
                            className={executiveTheme.buttonInfo}
                          >
                            Konfirmasi
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              applyInstruksiKeForm(item);
                              setMenu("buat_perintah");
                            }}
                            className={executiveTheme.buttonSecondary}
                          >
                            Tindak lanjut ke bawahan
                          </button>
                          {item.lapor_selesai_otomatis ? (
                            <span className="text-[11px] text-slate-400 max-w-md">
                              Selesai otomatis bila seluruh turunan perintah pada
                              Timeline monitor mencapai tahap 4 (Selesai).
                            </span>
                          ) : (
                            <button
                              onClick={() => bukaLaporSelesai(item.id)}
                              className={executiveTheme.buttonSuccess}
                            >
                              Lapor Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "buat_perintah" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Buat Perintah ke Bawahan"
                  subtitle="Penerima valid: Sekretaris, tiga kepala bidang, dan Kepala UPTD. Judul dapat disamakan dengan instruksi Gubernur lewat tombol « Tindak lanjut » dari Inbox Gubernur."
                  right={
                    linkedInstruksiId ? (
                      <button
                        type="button"
                        onClick={clearLinkedInstruksi}
                        className={executiveTheme.buttonSecondary}
                      >
                        Lepas tautan instruksi
                      </button>
                    ) : null
                  }
                />

                {linkedInstruksiId ? (
                  <div className="mx-4 mb-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-100">
                    Tertaut ke instruksi Gubernur #{linkedInstruksiId}. Laporan
                    selesai ke Gubernur akan diproses otomatis setelah seluruh
                    turunan task ini ditutup (status closed di timeline).
                  </div>
                ) : null}

                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>Judul</label>
                      <input
                        value={formPerintah.title}
                        onChange={(e) =>
                          setFormPerintah((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Penerima (role)
                      </label>
                      <select
                        value={formPerintah.assignee_role}
                        onChange={(e) =>
                          setFormPerintah((prev) => ({
                            ...prev,
                            assignee_role: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      >
                        <option value="sekretaris">Sekretaris</option>
                        <option value="kepala_bidang_ketersediaan">
                          Kabid Ketersediaan
                        </option>
                        <option value="kepala_bidang_distribusi">
                          Kabid Distribusi
                        </option>
                        <option value="kepala_bidang_konsumsi">
                          Kabid Konsumsi
                        </option>
                        <option value="kepala_uptd">Kepala UPTD</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={formPerintah.due_date}
                        onChange={(e) =>
                          setFormPerintah((prev) => ({
                            ...prev,
                            due_date: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Prioritas
                      </label>
                      <select
                        value={formPerintah.priority}
                        onChange={(e) =>
                          setFormPerintah((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      >
                        <option value={1}>Urgent</option>
                        <option value={2}>High</option>
                        <option value={3}>Normal</option>
                        <option value={4}>Low</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Deskripsi
                      </label>
                      <textarea
                        value={formPerintah.description}
                        onChange={(e) =>
                          setFormPerintah((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className={`${executiveTheme.input} min-h-[110px]`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={buatPerintah}
                      className={executiveTheme.buttonPrimary}
                    >
                      Kirim Perintah
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {menu === "inbox" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Inbox Gubernur"
                  subtitle="Daftar lengkap instruksi yang dikirimkan ke Kepala Dinas."
                  right={
                    <button
                      onClick={refreshAll}
                      className={executiveTheme.buttonSecondary}
                    >
                      Refresh
                    </button>
                  }
                />

                <div className="space-y-3 p-4">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : inbox.length === 0 ? (
                    <EmptyState text="Tidak ada instruksi." />
                  ) : (
                    inbox.map((item) => (
                      <div key={item.id} className={executiveTheme.itemCard}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              {item.nomor_instruksi || `#${item.id}`} -{" "}
                              {item.judul}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Jenis: {item.jenis} | Prioritas: {item.prioritas}{" "}
                              | Deadline: {item.deadline || "-"} | Status:{" "}
                              <span className="font-medium text-slate-100">
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => konfirmasiInstruksi(item.id)}
                              className={executiveTheme.buttonInfo}
                            >
                              Konfirmasi
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                applyInstruksiKeForm(item);
                                setMenu("buat_perintah");
                              }}
                              className={executiveTheme.buttonSecondary}
                            >
                              Tindak lanjut ke bawahan
                            </button>
                            {item.lapor_selesai_otomatis ? (
                              <span className="text-[11px] text-slate-400 max-w-md">
                                Selesai otomatis bila seluruh turunan perintah pada
                                Timeline monitor mencapai tahap 4 (Selesai).
                              </span>
                            ) : (
                              <button
                                onClick={() => bukaLaporSelesai(item.id)}
                                className={executiveTheme.buttonSuccess}
                              >
                                Lapor Selesai
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                          {item.isi_perintah}
                        </div>

                        {item.laporan_pelaksanaan ? (
                          <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                            <span className="font-medium text-slate-100">
                              Laporan:
                            </span>{" "}
                            {item.laporan_pelaksanaan}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "pengajuan_gub" ? (
              <div className="space-y-6">
                <div className={executiveTheme.panel}>
                  <PanelHeader
                    title="Kirim pengajuan ke Gubernur"
                    subtitle="Usulan strategis atau permintaan keputusan. Gubernur akan melihatnya di Inbox Pengajuan."
                  />
                  <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className={executiveTheme.subtleText}>Judul</label>
                      <input
                        value={formPengGub.judul}
                        onChange={(e) =>
                          setFormPengGub((p) => ({
                            ...p,
                            judul: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                        placeholder="Ringkas dan jelas"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>Jenis</label>
                      <select
                        value={formPengGub.jenis}
                        onChange={(e) =>
                          setFormPengGub((p) => ({
                            ...p,
                            jenis: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      >
                        <option value="laporan_strategis">
                          Laporan strategis
                        </option>
                        <option value="persetujuan_kebijakan">
                          Persetujuan kebijakan
                        </option>
                        <option value="persetujuan_anggaran">
                          Persetujuan anggaran
                        </option>
                        <option value="rekomendasi">Rekomendasi</option>
                        <option value="informasi">Informasi</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Kaitkan instruksi Gubernur (opsional)
                      </label>
                      <select
                        value={formPengGub.instruksi_id}
                        onChange={(e) =>
                          setFormPengGub((p) => ({
                            ...p,
                            instruksi_id: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                      >
                        <option value="">— Tidak ada —</option>
                        {inbox.map((it) => (
                          <option key={it.id} value={String(it.id)}>
                            {it.nomor_instruksi || `#${it.id}`} — {it.judul}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className={executiveTheme.subtleText}>
                        Isi pengajuan
                      </label>
                      <textarea
                        value={formPengGub.isi_pengajuan}
                        onChange={(e) =>
                          setFormPengGub((p) => ({
                            ...p,
                            isi_pengajuan: e.target.value,
                          }))
                        }
                        className={`${executiveTheme.input} min-h-[140px]`}
                        placeholder="Uraian singkat dan tujuan pengajuan..."
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className={executiveTheme.subtleText}>
                        Lampiran (tautan, opsional)
                      </label>
                      <input
                        value={formPengGub.lampiran_url}
                        onChange={(e) =>
                          setFormPengGub((p) => ({
                            ...p,
                            lampiran_url: e.target.value,
                          }))
                        }
                        className={executiveTheme.input}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={kirimPengajuanKeGubernur}
                        className={executiveTheme.buttonPrimary}
                      >
                        Kirim ke Gubernur
                      </button>
                    </div>
                  </div>
                </div>

                <div className={executiveTheme.panel}>
                  <PanelHeader
                    title="Riwayat pengajuan ke Gubernur"
                    subtitle="Status keputusan akan diperbarui setelah Gubernur memutuskan."
                  />
                  <div className="space-y-3 p-4">
                    {loading ? (
                      <EmptyState text="Memuat..." />
                    ) : pengajuanGub.length === 0 ? (
                      <EmptyState text="Belum ada pengajuan." />
                    ) : (
                      pengajuanGub.map((p) => (
                        <div key={p.id} className={executiveTheme.itemCard}>
                          <div className="text-sm font-semibold text-slate-100">
                            {p.nomor_pengajuan} — {p.judul}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            Jenis: {p.jenis} | Status:{" "}
                            <span className="font-medium text-slate-100">
                              {p.status}
                            </span>
                          </div>
                          {p.catatan_gubernur ? (
                            <div className="mt-2 text-xs text-slate-300">
                              Catatan Gubernur: {p.catatan_gubernur}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {menu === "perintah" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Perintah Saya"
                  subtitle="Daftar kartu perintah yang sudah dikeluarkan ke bawahan."
                  right={
                    <button
                      onClick={refreshAll}
                      className={executiveTheme.buttonSecondary}
                    >
                      Refresh
                    </button>
                  }
                />

                <div className="space-y-3 p-4">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : perintah.length === 0 ? (
                    <EmptyState text="Belum ada perintah." />
                  ) : (
                    perintah.map((task) => (
                      <div key={task.id} className={executiveTheme.itemCard}>
                        <div className="text-sm font-semibold text-slate-100">
                          {task.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Status:{" "}
                          <span className="font-medium text-slate-100">
                            {task.status}
                          </span>{" "}
                          | Deadline:{" "}
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </div>

                        {task.assignments?.length ? (
                          <div className="mt-2 text-xs text-slate-300">
                            Assigned ke:{" "}
                            {task.assignments
                              .map(
                                (assignment) =>
                                  `${assignment.assignee_role}${
                                    assignment.assignee_user_id
                                      ? `#${assignment.assignee_user_id}`
                                      : ""
                                  }`,
                              )
                              .join(", ")}
                          </div>
                        ) : null}

                        {task.description ? (
                          <div className="mt-2 whitespace-pre-wrap text-xs text-slate-300">
                            {task.description}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "approval" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Antrean internal dinas"
                  subtitle="Pengajuan yang sudah divalidasi Sekretaris — keputusan di tingkat Kepala Dinas (bukan Inbox Gubernur)."
                  right={
                    <div
                      className={`${executiveTheme.panelMeta} max-w-md text-right`}
                    >
                      PIN hanya untuk jenis persetujuan anggaran (sesuai
                      kebijakan sistem).
                    </div>
                  }
                />

                <div className="space-y-3 p-4">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : approval.length === 0 ? (
                    <EmptyState text="Tidak ada pengajuan." />
                  ) : (
                    approval.map((item) => (
                      <div key={item.id} className={executiveTheme.itemCard}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              {item.nomor_pengajuan || `#${item.id}`} -{" "}
                              {item.judul}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Jenis: {item.jenis}{" "}
                              {JENIS_PERLU_PIN_KADIN.has(item.jenis) ? (
                                <span className="font-medium text-amber-300">
                                  | PIN
                                </span>
                              ) : null}{" "}
                              | Status:{" "}
                              <span className="font-medium text-slate-100">
                                {item.status}
                              </span>{" "}
                              | Revisi: {item.revisi_ke || 0}
                            </div>
                            {item.catatan_sekretaris ? (
                              <div className="mt-1 text-[11px] text-slate-400">
                                Sekretaris: {item.catatan_sekretaris}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                bukaModalApproval(
                                  item.id,
                                  "setuju",
                                  item.jenis,
                                )
                              }
                              className={executiveTheme.buttonSuccess}
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                bukaModalApproval(
                                  item.id,
                                  "kembalikan",
                                  item.jenis,
                                )
                              }
                              className={executiveTheme.buttonWarning}
                            >
                              Kembalikan
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                bukaModalApproval(item.id, "tolak", item.jenis)
                              }
                              className={executiveTheme.buttonDanger}
                            >
                              Tolak
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                          {item.isi_pengajuan}
                        </div>

                        {item.catatan_kadin ? (
                          <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                            <span className="font-medium text-slate-100">
                              Catatan:
                            </span>{" "}
                            {item.catatan_kadin}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "diskusi" ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className={executiveTheme.panel}>
                  <PanelHeader
                    title="Gubernur ↔ Kepala Dinas"
                    subtitle="Klarifikasi instruksi strategis (bukan turunan tugas)."
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Pilih instruksi
                      </label>
                      <select
                        value={diskusiInstruksiId ?? ""}
                        onChange={(e) =>
                          setDiskusiInstruksiId(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        className={executiveTheme.input}
                      >
                        <option value="">—</option>
                        {inbox.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.nomor_instruksi || `#${it.id}`} — {it.judul}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ClarificationThreadPanel
                      anchorType={ANCHOR.INSTRUKSI}
                      anchorId={diskusiInstruksiId}
                      lane={LANES.GUBERNUR_KADIN}
                      title="Kanal diskusi"
                      subtitle="Hanya Gubernur dan Anda yang dapat membaca."
                      compact
                    />
                  </div>
                </div>
                <div className={executiveTheme.panel}>
                  <PanelHeader
                    title="Kepala Dinas ↔ penerima tugas"
                    subtitle="Pilih perintah yang sudah dikirim ke bawahan dari daftar Perintah Saya."
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className={executiveTheme.subtleText}>
                        Pilih perintah (tugas)
                      </label>
                      <select
                        value={diskusiTaskId}
                        onChange={(e) => setDiskusiTaskId(e.target.value)}
                        className={executiveTheme.input}
                      >
                        <option value="">— Pilih —</option>
                        {perintah.map((t) => (
                          <option key={t.id} value={String(t.id)}>
                            #{t.id} — {t.title || "Perintah"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ClarificationThreadPanel
                      anchorType={ANCHOR.TASK}
                      anchorId={
                        diskusiTaskId ? Number(diskusiTaskId) : null
                      }
                      lane={LANES.KADIN_ES3}
                      title="Kanal diskusi tugas"
                      compact
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {menu === "kinerja" ? (
              <div className={executiveTheme.panel}>
                <PanelHeader
                  title="Monitor Kinerja Lima Bawahan"
                  subtitle="Ringkasan performa unit yang melapor langsung ke Kepala Dinas."
                  right={
                    <button
                      onClick={refreshAll}
                      className={executiveTheme.buttonSecondary}
                    >
                      Refresh
                    </button>
                  }
                />

                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : kinerja.length === 0 ? (
                    <EmptyState text="Belum ada data." />
                  ) : (
                    kinerja.map((item) => (
                      <div key={item.key} className={executiveTheme.itemCard}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-100">
                              {item.label}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Total: {item.total} | Aktif: {item.aktif} |
                              Terlambat: {item.terlambat}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-extrabold text-slate-100">
                              {item.skor}
                            </div>
                            <div className="text-xs text-slate-400">
                              {item.kategori}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      <ExecutiveFormModal
        open={modalLapor != null}
        title="Lapor selesai"
        subtitle="Opsional: ringkasan pelaksanaan untuk arsip Gubernur."
        onClose={() => setModalLapor(null)}
        primaryLabel="Kirim"
        onPrimary={kirimLaporSelesai}
      >
        <textarea
          value={teksLaporan}
          onChange={(e) => setTeksLaporan(e.target.value)}
          className={`${executiveTheme.input} min-h-[100px] w-full`}
          placeholder="Tuliskan ringkasan tindak lanjut (boleh dikosongkan)..."
        />
      </ExecutiveFormModal>

      <ExecutiveFormModal
        open={!!modalApproval}
        title={
          modalApproval?.keputusan === "kembalikan"
            ? "Kembalikan ke pengaju"
            : modalApproval?.keputusan === "tolak"
              ? "Tolak pengajuan"
              : "PIN persetujuan anggaran"
        }
        subtitle={
          modalApproval?.keputusan === "setuju"
            ? "Masukkan PIN untuk mengonfirmasi keputusan sensitif."
            : "Catatan wajib agar pengaju memahami alasan."
        }
        onClose={() => setModalApproval(null)}
        primaryLabel="Konfirmasi"
        onPrimary={() =>
          eksekusiApproval(
            modalApproval.id,
            modalApproval.keputusan,
            modalApproval.jenis,
            teksApprovalCatatan,
            teksApprovalPin,
          )
        }
        primaryDisabled={
          modalApproval?.keputusan === "setuju"
            ? !teksApprovalPin.trim()
            : !teksApprovalCatatan.trim()
        }
      >
        {modalApproval &&
        modalApproval.keputusan === "setuju" &&
        JENIS_PERLU_PIN_KADIN.has(String(modalApproval.jenis || "")) ? (
          <input
            type="password"
            autoComplete="off"
            value={teksApprovalPin}
            onChange={(e) => setTeksApprovalPin(e.target.value)}
            className={executiveTheme.input}
            placeholder="PIN"
          />
        ) : null}
        {modalApproval &&
        (modalApproval.keputusan === "tolak" ||
          modalApproval.keputusan === "kembalikan") ? (
          <textarea
            value={teksApprovalCatatan}
            onChange={(e) => setTeksApprovalCatatan(e.target.value)}
            className={`${executiveTheme.input} min-h-[120px] w-full`}
            placeholder="Alasan penolakan atau pengembalian..."
          />
        ) : null}
      </ExecutiveFormModal>
    </div>
  );
}
