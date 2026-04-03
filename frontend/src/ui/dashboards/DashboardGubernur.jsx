import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import MapLayerPanel from "../../components/ui/MapLayerPanel";
import ExecutiveFormModal from "../../components/executive/ExecutiveFormModal.jsx";
import RantaiPerintahView from "../../components/gubernur/RantaiPerintahView.jsx";
import api from "../../services/api";
import ExecutiveHorizontalCoordinationPanel from "../../components/coordination/ExecutiveHorizontalCoordinationPanel.jsx";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { executiveTheme } from "./executiveTheme";
import ExecutionThreadObservabilityPanel from "../../components/execution/ExecutionThreadObservabilityPanel.jsx";
import CrossThreadSystemicPanel from "../../components/execution/CrossThreadSystemicPanel.jsx";

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
      <div className={executiveTheme.tileHint}>{hint}</div>
    </div>
  );
}

function PanelHeader({ title, subtitle, right }) {
  return (
    <div className={executiveTheme.panelHeader}>
      <div>
        <div className={executiveTheme.panelTitle}>{title}</div>
        {subtitle ? <div className={executiveTheme.panelSubtitle}>{subtitle}</div> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className={executiveTheme.mutedText}>{text}</div>;
}

function scrollToAnchor(id) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TrendGlyph({ direction }) {
  if (direction === "up") return <span className="text-emerald-400">▲</span>;
  if (direction === "down") return <span className="text-rose-400">▼</span>;
  return <span className="text-slate-500">■</span>;
}

export default function DashboardGubernur() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [instruksi, setInstruksi] = useState([]);
  const [pengajuan, setPengajuan] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [briefing, setBriefing] = useState(null);
  /** User dengan peran Kepala Dinas — penerima instruksi otomatis (Kepala Dinas Pangan). */
  const [kadinAssignees, setKadinAssignees] = useState([]);

  const [form, setForm] = useState({
    judul: "",
    isi_perintah: "",
    jenis: "instruksi",
    prioritas: "normal",
    deadline: "",
    assigned_to: "",
    lampiran_url: "",
  });

  const base = "/gubernur";
  const isAllowed = !!(user && roleName === "gubernur");

  /** overview | rantai */
  const [gubernurTab, setGubernurTab] = useState("overview");

  const [perhatian, setPerhatian] = useState(null);
  const [kinerjaKadis, setKinerjaKadis] = useState([]);
  const [filterInstruksi, setFilterInstruksi] = useState("semua");
  const [deadlineManual, setDeadlineManual] = useState(false);
  const [modalPengajuan, setModalPengajuan] = useState(null);
  const [modalCatatan, setModalCatatan] = useState("");
  /** Satu layar keputusan — payload /gubernur/dashboard/cockpit */
  const [cockpit, setCockpit] = useState(null);

  const kadinNameById = useMemo(() => {
    const m = new Map();
    (kadinAssignees || []).forEach((u) => {
      m.set(
        Number(u.id),
        u.nama_lengkap || u.name || u.username || "Kepala Dinas",
      );
    });
    return m;
  }, [kadinAssignees]);

  const instruksiTampil = useMemo(() => {
    const list = instruksi || [];
    if (filterInstruksi === "semua") return list;
    return list.filter((x) => String(x.status || "") === filterInstruksi);
  }, [instruksi, filterInstruksi]);

  const tiles = useMemo(() => {
    const s = summary || {};
    return [
      {
        label: "Perintah Aktif",
        value: s.perintah_aktif ?? "-",
        hint: "Instruksi yang sudah diterbitkan dan masih berjalan.",
      },
      {
        label: "Menunggu Approval",
        value: s.menunggu_approval ?? "-",
        hint: "Pengajuan dari Kepala Dinas yang belum diputuskan.",
      },
      {
        label: "Alert Kritis",
        value: s.alert_kritis ?? "-",
        hint: "Peringatan penting dan deadline terdekat.",
      },
      {
        label: "SLA",
        value: typeof s.sla_persen === "number" ? `${s.sla_persen}%` : "-",
        hint: "Indikator pelayanan agregat tahap MVP.",
      },
    ];
  }, [summary]);

  const refreshCockpit = useCallback(async () => {
    try {
      const r = await api.get(`${base}/dashboard/cockpit`);
      setCockpit(r.data?.data || null);
    } catch {
      setCockpit(null);
    }
  }, [base]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [a, b, c, d, e, att, kin, ck] = await Promise.all([
        api.get(`${base}/dashboard/summary`),
        api.get(`${base}/instruksi?limit=100`),
        api.get(`${base}/pengajuan?limit=25`),
        api.get(`${base}/notifikasi?limit=25`),
        api.get(`${base}/dashboard/briefing-harian`),
        api.get(`${base}/dashboard/perhatian`).catch(() => ({ data: {} })),
        api.get(`${base}/pemantauan/kinerja-kadis`).catch(() => ({ data: {} })),
        api.get(`${base}/dashboard/cockpit`).catch(() => ({ data: {} })),
      ]);
      setCockpit(ck.data?.data || null);
      setSummary(a.data?.data || null);
      setInstruksi(b.data?.data || []);
      setPengajuan(c.data?.data || []);
      setNotifikasi(d.data?.data || []);
      setBriefing(e.data?.data || null);
      setPerhatian(att.data?.data || null);
      setKinerjaKadis(kin.data?.data || []);

      let assigneeList = [];
      try {
        const f = await api.get(`${base}/assignees/kepala-dinas`);
        assigneeList = f.data?.data || [];
      } catch {
        /* endpoint opsional — fallback ke input ID manual */
      }
      setKadinAssignees(assigneeList);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal memuat dashboard Gubernur",
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
      void refreshCockpit();
    }, 60000);
    return () => clearInterval(t);
  }, [isAllowed, refreshCockpit]);

  useEffect(() => {
    if (!kadinAssignees.length) return;
    const first = kadinAssignees[0];
    setForm((prev) => ({ ...prev, assigned_to: String(first.id) }));
  }, [kadinAssignees]);

  useEffect(() => {
    if (!isAllowed || deadlineManual) return;
    let cancelled = false;
    api
      .get(`${base}/instruksi/saran-deadline`, {
        params: { jenis: form.jenis, prioritas: form.prioritas },
      })
      .then((r) => {
        const d = r.data?.data?.deadline;
        if (!cancelled && d) {
          setForm((p) => ({ ...p, deadline: d }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [form.jenis, form.prioritas, deadlineManual, isAllowed]);

  async function submitInstruksi() {
    try {
      if (!form.isi_perintah || !form.jenis) {
        toast.error("Lengkapi isi perintah dan jenis.");
        return;
      }
      if (!kadinAssignees.length) {
        toast.error(
          "Belum ada akun Kepala Dinas aktif. Hubungi admin untuk menambahkan pengguna.",
        );
        return;
      }
      const body = {
        judul: form.judul.trim() || undefined,
        isi_perintah: form.isi_perintah,
        jenis: form.jenis,
        prioritas: form.prioritas,
        deadline: form.deadline || null,
        deadline_manual: deadlineManual,
        lampiran_url: form.lampiran_url || null,
      };
      if (form.assigned_to) {
        body.assigned_to = Number(form.assigned_to);
      }
      await api.post(`${base}/instruksi`, body);
      toast.success("Instruksi dibuat sebagai draf");
      setForm((prev) => ({
        ...prev,
        judul: "",
        isi_perintah: "",
        lampiran_url: "",
      }));
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal membuat instruksi");
    }
  }

  async function terbitkanInstruksi(id) {
    try {
      await api.put(`${base}/instruksi/${id}/status`, {
        status: "diterbitkan",
      });
      toast.success("Instruksi diterbitkan");
      refreshAll();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal menerbitkan instruksi",
      );
    }
  }

  function bukaModalPutusan(id, keputusan) {
    if (keputusan === "setuju") {
      void eksekusiPutusan(id, "setuju", "");
      return;
    }
    setModalPengajuan({ id, keputusan });
    setModalCatatan("");
  }

  async function eksekusiPutusan(id, keputusan, catatan) {
    try {
      if (
        (keputusan === "tolak" || keputusan === "kembalikan") &&
        !String(catatan || "").trim()
      ) {
        toast.error("Catatan wajib diisi untuk tolak atau kembalikan.");
        return;
      }
      await api.post(`${base}/pengajuan/${id}/putuskan`, {
        keputusan,
        catatan: String(catatan || "").trim(),
      });
      toast.success("Keputusan tersimpan");
      setModalPengajuan(null);
      refreshAll();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal memutuskan pengajuan",
      );
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
          Silakan login sebagai Gubernur untuk mengakses dashboard ini.
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
              <div className={executiveTheme.heroKicker}>
                Pemerintah Provinsi Maluku Utara
              </div>
              <div className={executiveTheme.heroTitle}>Keputusan Hari Ini</div>
              <div className={executiveTheme.heroMeta}>
                Satu layar: prioritas, antrean, peringatan, dan indikator kinerja
              </div>
              <div className={executiveTheme.heroDescription}>
                Fokus pada apa yang harus diputuskan sekarang — tanpa istilah
                teknis. Data di bawah diperbarui otomatis setiap menit.
              </div>
            </div>

            <div className={executiveTheme.heroLoginCard}>
              <div className={executiveTheme.heroLoginLabel}>Login Sebagai</div>
              <div className={executiveTheme.heroLoginValue}>
                {user?.nama_lengkap || user?.username || "Gubernur"}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-white">Ringkas eksekutif</span>
            <span className="mx-2 text-slate-600">·</span>
            Pembaruan otomatis ±1 menit
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/audit-trail"
              className={`${executiveTheme.buttonSecondary} no-underline`}
            >
              Jejak keputusan
            </Link>
            <button
              type="button"
              onClick={() => {
                void refreshCockpit();
                refreshAll();
              }}
              className={executiveTheme.buttonPrimary}
            >
              Muat ulang
            </button>
          </div>
        </div>

        {cockpit?.prioritas_hari_ini?.length ? (
          <section className="mb-6" aria-label="Prioritas hari ini">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prioritas hari ini
            </div>
            <div className="flex flex-wrap gap-2">
              {cockpit.prioritas_hari_ini.map((pi) => (
                <button
                  key={pi.id}
                  type="button"
                  onClick={() => scrollToAnchor(pi.scroll_to)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition hover:bg-slate-800/80 ${
                    pi.severity === "critical"
                      ? "border-rose-500/40 bg-rose-950/40 text-rose-50"
                      : pi.severity === "warning"
                        ? "border-amber-500/35 bg-amber-950/25 text-amber-50"
                        : "border-emerald-500/30 bg-emerald-950/20 text-emerald-50"
                  }`}
                >
                  <span className="mr-2">{pi.emoji}</span>
                  {pi.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {cockpit?.smart_kpi ? (
          <section id="cockpit-kpi" className="mb-6">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Indikator kinerja (langsung)
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={executiveTheme.tile}>
                <div className={executiveTheme.tileAccent} aria-hidden />
                <div className={executiveTheme.tileLabel}>
                  Penyelesaian 7 hari
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={executiveTheme.tileValue}>
                    {cockpit.smart_kpi.penyelesaian_7_hari ?? "—"}
                  </div>
                  <TrendGlyph
                    direction={cockpit.smart_kpi.penyelesaian_trend?.direction}
                  />
                </div>
                <div className={executiveTheme.tileHint}>
                  {cockpit.smart_kpi.penyelesaian_trend?.label}
                </div>
              </div>
              <div className={executiveTheme.tile}>
                <div className={executiveTheme.tileAccent} aria-hidden />
                <div className={executiveTheme.tileLabel}>Instruksi aktif</div>
                <div className={executiveTheme.tileValue}>
                  {cockpit.smart_kpi.instruksi_aktif ?? "—"}
                </div>
                <div className={executiveTheme.tileHint}>
                  Masih berjalan (belum selesai)
                </div>
              </div>
              <div className={executiveTheme.tile}>
                <div className={executiveTheme.tileAccent} aria-hidden />
                <div className={executiveTheme.tileLabel}>
                  Kepatuhan respons
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={executiveTheme.tileValue}>
                    {typeof cockpit.smart_kpi.sla_compliance_pct === "number"
                      ? `${cockpit.smart_kpi.sla_compliance_pct}%`
                      : "—"}
                  </div>
                  <TrendGlyph
                    direction={cockpit.smart_kpi.sla_trend?.direction}
                  />
                </div>
                <div className={executiveTheme.tileHint}>
                  {cockpit.smart_kpi.sla_trend?.label}
                </div>
              </div>
              <div className={executiveTheme.tile}>
                <div className={executiveTheme.tileAccent} aria-hidden />
                <div className={executiveTheme.tileLabel}>
                  Keterlambatan terbuka
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={executiveTheme.tileValue}>
                    {cockpit.smart_kpi.keterlambatan_aktif ?? "—"}
                  </div>
                  <TrendGlyph
                    direction={
                      cockpit.smart_kpi.keterlambatan_trend?.direction
                    }
                  />
                </div>
                <div className={executiveTheme.tileHint}>
                  {cockpit.smart_kpi.keterlambatan_trend?.label}
                </div>
              </div>
            </div>
            {Array.isArray(cockpit.smart_kpi.kinerja_kadis) &&
            cockpit.smart_kpi.kinerja_kadis.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {cockpit.smart_kpi.kinerja_kadis.map((k) => (
                  <div
                    key={k.assigned_to ?? "kepala-dinas-pangan"}
                    className="min-w-[200px] shrink-0 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="text-sm font-semibold text-slate-100">
                      {k.nama_penerima}
                    </div>
                    {k.pejabat_nama ? (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {k.pejabat_nama}
                      </div>
                    ) : null}
                    <div
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        k.warna_indikator === "merah"
                          ? "bg-rose-500/20 text-rose-200"
                          : k.warna_indikator === "kuning"
                            ? "bg-amber-500/20 text-amber-100"
                            : "bg-emerald-500/20 text-emerald-100"
                      }`}
                    >
                      {k.kategori} · skor {k.skor}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Selesai {k.selesai}/{k.total} · Terlambat {k.terlambat}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => (
              <Tile
                key={tile.label}
                label={tile.label}
                value={tile.value}
                hint={tile.hint}
              />
            ))}
          </div>
        )}

        {cockpit?.execution_threads?.recent_threads?.length ? (
          <section
            id="cockpit-execution-threads"
            className="mb-6"
            aria-label="Thread eksekusi multi-level"
          >
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Thread eksekusi (semua level)
            </div>
            <div className={`${executiveTheme.panel} space-y-2`}>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span>
                  Thread dipantau:{" "}
                  <strong className="text-slate-200">
                    {cockpit.execution_threads.active_threads ?? "—"}
                  </strong>
                </span>
                <span>
                  Instruksi belum selesai:{" "}
                  <strong className="text-slate-200">
                    {cockpit.execution_threads.instruksi_belum_selesai ?? "—"}
                  </strong>
                </span>
              </div>
              <ul className="divide-y divide-slate-800/80">
                {cockpit.execution_threads.recent_threads.map((row) => (
                  <li
                    key={row.execution_thread_id}
                    className="py-2 text-sm text-slate-200"
                  >
                    <Link
                      to={`/dashboard/execution-thread/${encodeURIComponent(row.execution_thread_id)}`}
                      className="font-medium text-sky-300 hover:underline"
                    >
                      {row.judul}
                    </Link>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                      {row.execution_thread_id}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <div className="mb-6">
          <CrossThreadSystemicPanel />
        </div>

        <div className="mb-6">
          <ExecutionThreadObservabilityPanel title="Observabilitas thread lintas level" />
        </div>

        {cockpit?.highlight_masalah?.length ? (
          <section className="mb-6" aria-label="Peringatan pola">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Peringatan pola
            </div>
            <div className="space-y-2">
              {cockpit.highlight_masalah.map((h) => (
                <div
                  key={h.id}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    h.level === "critical"
                      ? "border-rose-500/40 bg-rose-950/30 text-rose-50"
                      : "border-amber-500/35 bg-amber-950/20 text-amber-50"
                  }`}
                >
                  <div className="font-semibold">{h.headline}</div>
                  <div className="mt-1 text-xs opacity-90">{h.detail}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!cockpit && perhatian?.ringkasan ? (
          <div className={`${executiveTheme.panel} mb-6`}>
            <PanelHeader
              title="Perlu perhatian hari ini"
              subtitle="Ringkasan otomatis dari status instruksi dan pengajuan strategis."
            />
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  k: "Menunggu dibaca Kadis",
                  v: perhatian.ringkasan.menunggu_dibaca_kadis,
                },
                {
                  k: "Dibaca, belum ditindaklanjuti",
                  v: perhatian.ringkasan.dibaca_belum_ditindaklanjuti,
                },
                {
                  k: "Sedang diproses",
                  v: perhatian.ringkasan.sedang_diproses,
                },
                { k: "Terlambat", v: perhatian.ringkasan.terlambat },
                {
                  k: "Pengajuan tunggu keputusan",
                  v: perhatian.ringkasan.pengajuan_menunggu_keputusan,
                },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {x.k}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                    {x.v ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!cockpit && kinerjaKadis.length > 0 ? (
          <div className={`${executiveTheme.panel} mb-6`}>
            <PanelHeader
              title="Pantauan kinerja Kepala Dinas"
              subtitle="Berdasarkan instruksi yang Anda terbitkan (indikator otomatis)."
            />
            <div className="flex gap-3 overflow-x-auto p-4 pb-5">
              {kinerjaKadis.map((k) => (
                <div
                  key={k.assigned_to ?? "kepala-dinas-pangan"}
                  className="min-w-[200px] shrink-0 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                >
                  <div className="text-sm font-semibold text-slate-100">
                    {k.nama_penerima}
                  </div>
                  {k.pejabat_nama ? (
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {k.pejabat_nama}
                    </div>
                  ) : null}
                  <div
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      k.warna_indikator === "merah"
                        ? "bg-rose-500/20 text-rose-200"
                        : k.warna_indikator === "kuning"
                          ? "bg-amber-500/20 text-amber-100"
                          : "bg-emerald-500/20 text-emerald-100"
                    }`}
                  >
                    {k.kategori} · skor {k.skor}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Selesai {k.selesai}/{k.total} · Terlambat {k.terlambat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {cockpit?.yang_harus_diputuskan?.length ? (
          <section
            id="cockpit-putusan"
            className={`${executiveTheme.panel} mb-6`}
            aria-label="Antrean keputusan"
          >
            <PanelHeader
              title="Yang harus diputuskan sekarang"
              subtitle="Maksimal 5 urutan paling mendesak — pengajuan dan instruksi kritis."
            />
            <div className="space-y-3 p-4">
              {cockpit.yang_harus_diputuskan.map((slot) => {
                if (slot.kind === "pengajuan") {
                  const item = slot.item;
                  const sev = item.severity_level || "normal";
                  const badgeClass =
                    sev === "critical"
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-100"
                      : sev === "warning"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                        : "border-emerald-500/35 bg-emerald-500/10 text-emerald-100";
                  return (
                    <div key={`p-${item.id}`} className={executiveTheme.itemCard}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${badgeClass}`}
                            >
                              {item.recommendation_label || "Tinjau"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Skor keputusan {item.decision_score ?? "—"}/100
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-100">
                            {item.nomor_pengajuan || `#${item.id}`} — {item.judul}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            Jenis: {item.jenis} · Revisi: {item.revisi_ke || 0}
                            {item.sla?.label
                              ? ` · ${item.sla.label}`
                              : ""}
                          </div>
                          {Array.isArray(item.explain_lines) &&
                          item.explain_lines.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-slate-400">
                              {item.explain_lines.slice(0, 4).map((line, i) => (
                                <li key={`${item.id}-exp-${i}`}>{line}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => bukaModalPutusan(item.id, "setuju")}
                            className={executiveTheme.buttonSuccess}
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => bukaModalPutusan(item.id, "kembalikan")}
                            className={executiveTheme.buttonWarning}
                          >
                            Klarifikasi
                          </button>
                          <button
                            type="button"
                            onClick={() => bukaModalPutusan(item.id, "tolak")}
                            className={executiveTheme.buttonDanger}
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                const ins = slot.item;
                return (
                  <div key={`i-${ins.id}`} className={executiveTheme.itemCard}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-100">
                          Instruksi kritis
                        </span>
                        <div className="mt-2 text-sm font-semibold text-slate-100">
                          {ins.nomor_instruksi || `#${ins.id}`} — {ins.judul}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Status: {ins.status}
                          {ins.deadline ? ` · Batas ${ins.deadline}` : ""}
                          {ins.sla?.label ? ` · ${ins.sla.label}` : ""}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGubernurTab("overview");
                            setFilterInstruksi(
                              ins.status === "draf" ? "draf" : "semua",
                            );
                            scrollToAnchor("monitor-instruksi");
                          }}
                          className={executiveTheme.buttonInfo}
                        >
                          Buka detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Ringkasan & instruksi" },
            { id: "rantai", label: "Rantai perintah" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setGubernurTab(t.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
                gubernurTab === t.id
                  ? "bg-sky-500/20 border-sky-500/60 text-sky-100"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {gubernurTab === "rantai" ? (
          <div className="mb-6">
            <RantaiPerintahView
              instruksiList={instruksi}
              onRefresh={refreshAll}
            />
          </div>
        ) : null}

        {gubernurTab === "overview" ? (
          <>
        <ExecutiveHorizontalCoordinationPanel subtitle="Agregat dari permintaan koordinasi horizontal pada thread eksekusi." />

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className={executiveTheme.panel}>
            <PanelHeader
              title="Peta Ketahanan Pangan"
              subtitle="Ringkasan visual wilayah Maluku Utara untuk stok, distribusi, dan kerawanan."
              right={<div className={executiveTheme.panelMeta}>Mode MVP</div>}
            />
            <div className="p-4">
              <MapLayerPanel title="Maluku Utara - Kerawanan, stok, dan distribusi" />
            </div>
          </div>

          <div className={executiveTheme.panel}>
            <PanelHeader
              title="Inbox Pengajuan"
              subtitle="Pengajuan strategis dari Kepala Dinas yang memerlukan keputusan Gubernur."
              right={
                <div className={executiveTheme.panelMeta}>
                  {pengajuan?.length || 0} item
                </div>
              }
            />

            <div className="space-y-3 p-4">
              {loading ? (
                <EmptyState text="Memuat..." />
              ) : pengajuan.length === 0 ? (
                <EmptyState text="Tidak ada pengajuan." />
              ) : (
                pengajuan.slice(0, 8).map((item) => (
                  <div key={item.id} className={executiveTheme.itemCard}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">
                          {item.nomor_pengajuan || `#${item.id}`} - {item.judul}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Jenis: {item.jenis} | Status:{" "}
                          <span className="font-medium text-slate-100">
                            {item.status}
                          </span>{" "}
                          | Revisi: {item.revisi_ke || 0}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bukaModalPutusan(item.id, "setuju")}
                          className={executiveTheme.buttonSuccess}
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => bukaModalPutusan(item.id, "kembalikan")}
                          className={executiveTheme.buttonWarning}
                        >
                          Kembalikan
                        </button>
                        <button
                          type="button"
                          onClick={() => bukaModalPutusan(item.id, "tolak")}
                          className={executiveTheme.buttonDanger}
                        >
                          Tolak
                        </button>
                      </div>
                    </div>

                    {item.catatan_gubernur ? (
                      <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                        Catatan: {item.catatan_gubernur}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div id="monitor-instruksi" className={executiveTheme.panel}>
            <PanelHeader
              title="Monitor Instruksi Gubernur"
              subtitle="Draft, penerbitan, dan pemantauan instruksi strategis."
              right={
                <div className={executiveTheme.panelMeta}>
                  {instruksiTampil?.length || 0} ditampilkan
                </div>
              }
            />

            <div className="flex flex-wrap gap-2 border-b border-slate-800 px-4 py-3">
              {[
                { id: "semua", label: "Semua" },
                { id: "diterbitkan", label: "Belum dibaca Kadis" },
                { id: "dibaca", label: "Belum ditindaklanjuti" },
                { id: "diproses", label: "Diproses" },
                { id: "terlambat", label: "Terlambat" },
                { id: "draf", label: "Draf" },
                { id: "selesai", label: "Selesai" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterInstruksi(f.id)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    filterInstruksi === f.id
                      ? "border-sky-500/50 bg-sky-500/15 text-sky-100"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 p-4">
              <div className={executiveTheme.itemCard}>
                <div className="mb-3 text-sm font-semibold text-slate-100">
                  Buat Instruksi
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className={executiveTheme.subtleText}>
                      Judul (opsional)
                    </label>
                    <input
                      value={form.judul}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, judul: e.target.value }))
                      }
                      className={executiveTheme.input}
                      placeholder="Kosongkan — sistem buat ringkas dari isi perintah"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={executiveTheme.subtleText}>
                      Ditugaskan kepada
                    </label>
                    <div
                      className={`${executiveTheme.input} bg-slate-950/60 text-slate-200`}
                    >
                      <span className="font-medium text-slate-100">
                        Kepala Dinas Pangan
                      </span>
                      {kadinAssignees[0] ? (
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Pejabat:{" "}
                          {kadinAssignees[0].nama_lengkap ||
                            kadinAssignees[0].name ||
                            kadinAssignees[0].username}
                        </span>
                      ) : (
                        <span className="mt-1 block text-xs text-rose-400">
                          Akun Kepala Dinas belum terdaftar — hubungi admin.
                        </span>
                      )}
                    </div>
                    {kadinAssignees.length > 1 ? (
                      <p className="text-[11px] text-amber-200/90">
                        Terdeteksi lebih dari satu akun dengan peran Kepala
                        Dinas; sistem memakai urutan pertama (nama) untuk
                        penerimaan instruksi. Rapatkan data pengguna bila
                        hanya ada satu jabatan.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Penerima ditetapkan otomatis — tidak perlu memilih
                        pengguna.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={executiveTheme.subtleText}>Jenis</label>
                    <select
                      value={form.jenis}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, jenis: e.target.value }))
                      }
                      className={executiveTheme.input}
                    >
                      <option value="instruksi">Instruksi</option>
                      <option value="disposisi">Disposisi</option>
                      <option value="arahan_strategis">Arahan Strategis</option>
                      <option value="minta_laporan">Permintaan Laporan</option>
                      <option value="tanggap_darurat">Tanggap Darurat</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={executiveTheme.subtleText}>Prioritas</label>
                    <select
                      value={form.prioritas}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          prioritas: e.target.value,
                        }))
                      }
                      className={executiveTheme.input}
                    >
                      <option value="normal">Normal</option>
                      <option value="tinggi">Tinggi</option>
                      <option value="mendesak">Mendesak</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={deadlineManual}
                        onChange={(e) => {
                          setDeadlineManual(e.target.checked);
                          if (!e.target.checked) {
                            api
                              .get(`${base}/instruksi/saran-deadline`, {
                                params: {
                                  jenis: form.jenis,
                                  prioritas: form.prioritas,
                                },
                              })
                              .then((r) => {
                                const d = r.data?.data?.deadline;
                                if (d)
                                  setForm((p) => ({ ...p, deadline: d }));
                              })
                              .catch(() => {});
                          }
                        }}
                        className="rounded border-slate-600"
                      />
                      Atur batas waktu secara manual (tanpa saran sistem)
                    </label>
                    <label className={executiveTheme.subtleText}>
                      Batas waktu tindak lanjut
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          deadline: e.target.value,
                        }))
                      }
                      disabled={!deadlineManual}
                      className={`${executiveTheme.input} disabled:opacity-50`}
                    />
                    {!deadlineManual ? (
                      <p className="text-[11px] text-slate-500">
                        Diisi otomatis dari jenis dan prioritas (dapat diubah
                        lewat kotak centang di atas).
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={executiveTheme.subtleText}>
                      Lampiran URL
                    </label>
                    <input
                      value={form.lampiran_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          lampiran_url: e.target.value,
                        }))
                      }
                      className={executiveTheme.input}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className={executiveTheme.subtleText}>
                      Isi Perintah
                    </label>
                    <textarea
                      value={form.isi_perintah}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          isi_perintah: e.target.value,
                        }))
                      }
                      className={`${executiveTheme.input} min-h-[110px]`}
                      placeholder="Tuliskan isi instruksi..."
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={refreshAll}
                    className={executiveTheme.buttonSecondary}
                  >
                    Refresh
                  </button>
                  <button
                    onClick={submitInstruksi}
                    className={executiveTheme.buttonPrimary}
                  >
                    Simpan Draf
                  </button>
                </div>
              </div>

              {loading ? (
                <EmptyState text="Memuat..." />
              ) : instruksiTampil.length === 0 ? (
                <EmptyState text="Tidak ada instruksi untuk filter ini." />
              ) : (
                instruksiTampil.slice(0, 12).map((item) => (
                  <div key={item.id} className={executiveTheme.itemCard}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">
                          {item.nomor_instruksi || `#${item.id}`} - {item.judul}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Jenis: {item.jenis} | Prioritas: {item.prioritas} |
                          Status:{" "}
                          <span className="font-medium text-slate-100">
                            {item.status}
                          </span>
                          {" | "}
                          Kepala Dinas:{" "}
                          <span className="font-medium text-slate-200">
                            {kadinNameById.get(Number(item.assigned_to)) ||
                              "Kepala Dinas"}
                          </span>
                          {item.deadline ? ` · Batas: ${item.deadline}` : ""}
                        </div>
                      </div>

                      {item.status === "draf" ? (
                        <button
                          onClick={() => terbitkanInstruksi(item.id)}
                          className={executiveTheme.buttonInfo}
                        >
                          Terbitkan
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
                      {item.isi_perintah}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={executiveTheme.panel}>
            <PanelHeader
              title="Briefing dan Notifikasi"
              subtitle="Ringkasan harian serta feed notifikasi untuk pimpinan."
            />

            <div className="space-y-3 p-4">
              <div className={executiveTheme.itemCard}>
                <div className="text-sm font-semibold text-slate-100">
                  Briefing Harian
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {briefing?.tanggal || "-"}
                </div>
                <div className="mt-3 text-sm text-slate-200">
                  {briefing?.ringkas || "-"}
                </div>
                {Array.isArray(briefing?.highlight) ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
                    {briefing.highlight.slice(0, 5).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className={executiveTheme.itemCard}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-100">
                    Feed Notifikasi
                  </div>
                  <div className={executiveTheme.panelMeta}>
                    {notifikasi?.length || 0} item
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {loading ? (
                    <EmptyState text="Memuat..." />
                  ) : notifikasi.length === 0 ? (
                    <EmptyState text="Belum ada notifikasi." />
                  ) : (
                    notifikasi.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-sm shadow-black/20"
                      >
                        <div className="text-xs text-slate-400">
                          {item.jenis} | {item.sudah_dibaca ? "dibaca" : "baru"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                          {item.judul}
                        </div>
                        {item.isi ? (
                          <div className="mt-1 whitespace-pre-wrap text-xs text-slate-300">
                            {item.isi}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : null}
      </div>

      <ExecutiveFormModal
        open={!!modalPengajuan}
        title={
          modalPengajuan?.keputusan === "kembalikan"
            ? "Klarifikasi / kembalikan pengajuan"
            : "Tolak pengajuan"
        }
        subtitle="Catatan wajib agar Kepala Dinas memahami apa yang perlu diperbaiki."
        onClose={() => setModalPengajuan(null)}
        primaryLabel="Kirim keputusan"
        onPrimary={() =>
          eksekusiPutusan(
            modalPengajuan.id,
            modalPengajuan.keputusan,
            modalCatatan,
          )
        }
        primaryDisabled={!String(modalCatatan || "").trim()}
      >
        <textarea
          value={modalCatatan}
          onChange={(e) => setModalCatatan(e.target.value)}
          className={`${executiveTheme.input} min-h-[120px] w-full`}
          placeholder="Tulis catatan untuk Kepala Dinas..."
        />
      </ExecutiveFormModal>
    </div>
  );
}
