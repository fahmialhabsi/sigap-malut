import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import api from "../../utils/api";
import KadinExecutiveTimeline from "../../components/kadin/KadinExecutiveTimeline.jsx";

const JENIS_PERLU_PIN_KADIN = new Set(["persetujuan_anggaran"]);

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
    <div className="rounded-2xl border border-exec-border bg-gradient-to-br from-white via-teal-50/35 to-rose-50/30 p-4 shadow-sm ring-1 ring-teal-100/40">
      <div className="text-xs text-exec-muted font-medium">{label}</div>
      <div className="text-2xl font-extrabold mt-1 text-teal-900 tabular-nums">
        {value ?? "—"}
      </div>
      {hint ? <div className="text-[11px] text-exec-muted mt-1">{hint}</div> : null}
    </div>
  );
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

  async function refreshAll() {
    setLoading(true);
    try {
      const [a, b, c, d, e] = await Promise.all([
        api.get("/api/kadin/dashboard/summary"),
        api.get("/api/kadin/inbox-gubernur?limit=25"),
        api.get("/api/kadin/perintah?limit=25"),
        api.get("/api/kadin/approval?limit=25"),
        api.get("/api/kadin/kinerja/bawahan"),
      ]);
      setSummary(a.data?.data || null);
      setInbox(b.data?.data || []);
      setPerintah(c.data?.data || []);
      setApproval(d.data?.data || []);
      setKinerja(e.data?.data || []);
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

  const tiles = useMemo(() => {
    const s = summary || {};
    return [
      {
        label: "Inbox Gubernur",
        value: s.inbox_gubernur ?? "—",
        hint: "Instruksi baru (diterbitkan)",
      },
      {
        label: "Perintah Aktif",
        value: s.perintah_aktif ?? "—",
        hint: "Tugas ke 5 bawahan langsung",
      },
      {
        label: "Approval Queue",
        value: s.approval_queue ?? "—",
        hint: "Setelah gateway Sekretaris",
      },
      {
        label: "SLA%",
        value: typeof s.sla_persen === "number" ? `${s.sla_persen}%` : "—",
        hint: "MVP",
      },
      { label: "Alert Kritis", value: s.alert_kritis ?? "—", hint: "MVP" },
    ];
  }, [summary]);

  async function konfirmasiInstruksi(id) {
    try {
      await api.post(`/api/kadin/inbox-gubernur/${id}/konfirmasi`);
      toast.success("Instruksi dikonfirmasi (dibaca)");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal konfirmasi");
    }
  }

  async function laporSelesaiInstruksi(id) {
    try {
      const laporan =
        window.prompt("Tulis laporan pelaksanaan (opsional):", "") || "";
      await api.post(`/api/kadin/inbox-gubernur/${id}/lapor-selesai`, {
        laporan_pelaksanaan: laporan,
      });
      toast.success("Instruksi ditandai selesai");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal lapor selesai");
    }
  }

  async function buatPerintah() {
    try {
      if (!formPerintah.title || !formPerintah.assignee_role) {
        toast.error("Lengkapi minimal: judul & penerima");
        return;
      }
      await api.post("/api/kadin/perintah", {
        title: formPerintah.title,
        description: formPerintah.description,
        assignee_role: formPerintah.assignee_role,
        assignee_user_id: formPerintah.assignee_user_id
          ? Number(formPerintah.assignee_user_id)
          : null,
        due_date: formPerintah.due_date || null,
        priority: Number(formPerintah.priority || 3),
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
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal membuat perintah");
    }
  }

  async function putuskanApproval(id, keputusan, jenis) {
    try {
      const perluPin = JENIS_PERLU_PIN_KADIN.has(String(jenis || ""));
      let pin;
      if (perluPin) {
        pin =
          window.prompt(
            "PIN wajib untuk persetujuan anggaran (env CRITICAL_ACTION_PIN, default MVP: 123456):",
            "",
          ) || "";
        if (!pin) return;
      }
      const catatan =
        keputusan === "setuju"
          ? ""
          : window.prompt("Catatan wajib (tolak/kembalikan):", "") || "";
      if ((keputusan === "tolak" || keputusan === "kembalikan") && !catatan)
        return;
      await api.post(`/api/kadin/approval/${id}/putuskan`, {
        ...(perluPin ? { pin } : {}),
        keputusan,
        catatan,
      });
      toast.success("Keputusan tersimpan");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memutuskan approval");
    }
  }

  if (!isAllowed) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Dashboard ini hanya untuk Kepala Dinas.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full min-w-0 bg-gradient-to-br from-exec-canvas via-white to-exec-canvas2 text-exec-ink antialiased">
      <div className="w-full max-w-[100vw] mx-auto box-border px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 pb-12">
        <div className="relative rounded-2xl border border-exec-border bg-white/95 shadow-exec mb-6 p-5 sm:p-6 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-teal-600 via-teal-400 to-rose-400"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-4 flex-wrap pl-2 sm:pl-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                Executive Command
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-exec-ink">
                Kepala Dinas Pangan Provinsi Maluku Utara
              </div>
              <div className="text-sm text-exec-muted mt-2 max-w-2xl leading-relaxed">
                Inbox Gubernur, perintah ke 5 bawahan, approval, dan monitoring.
                Layout memenuhi lebar layar di desktop, laptop, tablet, dan ponsel.
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-exec-muted">Login sebagai</div>
              <div className="text-sm font-semibold text-exec-ink">
                {user?.nama_lengkap || user?.username || "Kepala Dinas"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-2xl border border-exec-border bg-white/95 shadow-sm p-4 h-fit lg:sticky lg:top-4">
            <div className="text-xs text-exec-muted font-semibold mb-3">MENU</div>
            <div className="space-y-1">
              {[
                { k: "overview", label: "📊 Dashboard" },
                { k: "inbox", label: "📥 Inbox Gubernur" },
                { k: "perintah", label: "📋 Perintah Saya" },
                { k: "approval", label: "✅ Approval Queue" },
                { k: "kinerja", label: "📈 Monitor Kinerja Bawahan" },
              ].map((m) => (
                <button
                  key={m.k}
                  onClick={() => setMenu(m.k)}
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition-colors ${
                    menu === m.k
                      ? "bg-teal-50 border-teal-200 text-teal-900 font-semibold shadow-sm"
                      : "bg-transparent border-transparent hover:bg-rose-50/70 hover:border-rose-100 text-exec-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {tiles.map((t) => (
                <Tile
                  key={t.label}
                  label={t.label}
                  value={t.value}
                  hint={t.hint}
                />
              ))}
            </div>

            {(menu === "overview" || menu === "perintah") && (
              <KadinExecutiveTimeline
                inbox={menu === "overview" ? inbox : []}
                perintah={perintah}
                loading={loading}
              />
            )}

            {menu === "overview" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
                    <div className="font-semibold">Inbox Gubernur (ringkas)</div>
                    <button
                      onClick={refreshAll}
                      className="text-xs px-3 py-1.5 rounded-lg border border-exec-border hover:bg-slate-50"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {loading ? (
                      <div className="text-sm text-exec-muted">Memuat...</div>
                    ) : inbox.length === 0 ? (
                      <div className="text-sm text-exec-muted">
                        Tidak ada instruksi.
                      </div>
                    ) : (
                      inbox.slice(0, 6).map((x) => (
                        <div
                          key={x.id}
                          className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4"
                        >
                          <div className="text-sm font-semibold">
                            {x.nomor_instruksi || `#${x.id}`} — {x.judul}
                          </div>
                          <div className="text-xs text-exec-muted mt-1">
                            Jenis: {x.jenis} · Prioritas: {x.prioritas} · Status:{" "}
                            <span className="font-medium text-exec-ink">
                              {x.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => konfirmasiInstruksi(x.id)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-sky-600 hover:bg-sky-700"
                            >
                              Konfirmasi Terima
                            </button>
                            <button
                              onClick={() => laporSelesaiInstruksi(x.id)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                              Lapor Selesai
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-exec-border">
                    <div className="font-semibold">Buat Perintah ke Bawahan</div>
                    <div className="text-xs text-exec-muted">
                      Penerima valid: Sekretaris, Kabid (3), Kepala UPTD
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-exec-muted">Judul</label>
                        <input
                          value={formPerintah.title}
                          onChange={(e) =>
                            setFormPerintah((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-exec-muted">
                          Penerima (role)
                        </label>
                        <select
                          value={formPerintah.assignee_role}
                          onChange={(e) =>
                            setFormPerintah((p) => ({
                              ...p,
                              assignee_role: e.target.value,
                            }))
                          }
                          className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
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
                        <label className="text-xs text-exec-muted">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={formPerintah.due_date}
                          onChange={(e) =>
                            setFormPerintah((p) => ({
                              ...p,
                              due_date: e.target.value,
                            }))
                          }
                          className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-exec-muted">
                          Prioritas
                        </label>
                        <select
                          value={formPerintah.priority}
                          onChange={(e) =>
                            setFormPerintah((p) => ({
                              ...p,
                              priority: e.target.value,
                            }))
                          }
                          className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                        >
                          <option value={1}>Urgent</option>
                          <option value={2}>High</option>
                          <option value={3}>Normal</option>
                          <option value={4}>Low</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-xs text-exec-muted">
                          Deskripsi
                        </label>
                        <textarea
                          value={formPerintah.description}
                          onChange={(e) =>
                            setFormPerintah((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm min-h-[96px] text-exec-ink shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={buatPerintah}
                        className="px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700"
                      >
                        Kirim Perintah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {menu === "inbox" ? (
              <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
                  <div className="font-semibold">Inbox Gubernur</div>
                  <button
                    onClick={refreshAll}
                    className="text-xs px-3 py-1.5 rounded-lg border border-exec-border hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-sm text-exec-muted">Memuat...</div>
                  ) : inbox.length === 0 ? (
                    <div className="text-sm text-exec-muted">
                      Tidak ada instruksi.
                    </div>
                  ) : (
                    inbox.map((x) => (
                      <div
                        key={x.id}
                        className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">
                              {x.nomor_instruksi || `#${x.id}`} — {x.judul}
                            </div>
                            <div className="text-xs text-exec-muted mt-1">
                              Jenis: {x.jenis} · Prioritas: {x.prioritas} ·
                              Deadline: {x.deadline || "—"} · Status:{" "}
                              <span className="font-medium text-exec-ink">
                                {x.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => konfirmasiInstruksi(x.id)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-sky-600 hover:bg-sky-700"
                            >
                              Konfirmasi Terima
                            </button>
                            <button
                              onClick={() => laporSelesaiInstruksi(x.id)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                              Lapor Selesai
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                          {x.isi_perintah}
                        </div>
                        {x.laporan_pelaksanaan ? (
                          <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                            <span className="text-exec-ink font-medium">
                              Laporan:
                            </span>{" "}
                            {x.laporan_pelaksanaan}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "perintah" ? (
              <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Perintah Saya</div>
                    <div className="text-xs text-exec-muted mt-1">
                      Ringkasan kartu (timeline visual di atas).
                    </div>
                  </div>
                  <button
                    onClick={refreshAll}
                    className="text-xs px-3 py-1.5 rounded-lg border border-exec-border hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-sm text-exec-muted">Memuat...</div>
                  ) : perintah.length === 0 ? (
                    <div className="text-sm text-exec-muted">
                      Belum ada perintah.
                    </div>
                  ) : (
                    perintah.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4"
                      >
                        <div className="text-sm font-semibold">{t.title}</div>
                        <div className="text-xs text-exec-muted mt-1">
                          Status:{" "}
                          <span className="text-exec-ink font-medium">
                            {t.status}
                          </span>{" "}
                          · Deadline:{" "}
                          {t.due_date
                            ? new Date(t.due_date).toLocaleDateString("id-ID")
                            : "—"}
                        </div>
                        {t.assignments?.length ? (
                          <div className="mt-2 text-xs text-exec-muted">
                            Assigned ke:{" "}
                            {t.assignments
                              .map(
                                (a) =>
                                  `${a.assignee_role}${
                                    a.assignee_user_id
                                      ? `#${a.assignee_user_id}`
                                      : ""
                                  }`,
                              )
                              .join(", ")}
                          </div>
                        ) : null}
                        {t.description ? (
                          <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                            {t.description}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "approval" ? (
              <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
                  <div className="font-semibold">Approval Queue</div>
                  <div className="text-xs text-exec-muted max-w-md text-right">
                    Antrean hanya pengajuan yang sudah divalidasi Sekretaris. PIN
                    hanya untuk jenis strategis (mis. persetujuan anggaran).
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-sm text-exec-muted">Memuat...</div>
                  ) : approval.length === 0 ? (
                    <div className="text-sm text-exec-muted">
                      Tidak ada pengajuan.
                    </div>
                  ) : (
                    approval.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">
                              {p.nomor_pengajuan || `#${p.id}`} — {p.judul}
                            </div>
                            <div className="text-xs text-exec-muted mt-1">
                              Jenis: {p.jenis}{" "}
                              {JENIS_PERLU_PIN_KADIN.has(p.jenis) ? (
                                <span className="text-amber-700 font-medium">
                                  · PIN
                                </span>
                              ) : null}{" "}
                              · Status:{" "}
                              <span className="font-medium text-exec-ink">
                                {p.status}
                              </span>{" "}
                              · Revisi: {p.revisi_ke || 0}
                            </div>
                            {p.catatan_sekretaris ? (
                              <div className="text-[11px] text-exec-muted mt-1">
                                Sekretaris: {p.catatan_sekretaris}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                putuskanApproval(p.id, "setuju", p.jenis)
                              }
                              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() =>
                                putuskanApproval(p.id, "kembalikan", p.jenis)
                              }
                              className="px-3 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-700"
                            >
                              Kembalikan
                            </button>
                            <button
                              onClick={() =>
                                putuskanApproval(p.id, "tolak", p.jenis)
                              }
                              className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-700"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                          {p.isi_pengajuan}
                        </div>
                        {p.catatan_kadin ? (
                          <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                            <span className="text-exec-ink font-medium">
                              Catatan:
                            </span>{" "}
                            {p.catatan_kadin}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {menu === "kinerja" ? (
              <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
                  <div className="font-semibold">Monitor Kinerja 5 Bawahan</div>
                  <button
                    onClick={refreshAll}
                    className="text-xs px-3 py-1.5 rounded-lg border border-exec-border hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="text-sm text-exec-muted">Memuat...</div>
                  ) : kinerja.length === 0 ? (
                    <div className="text-sm text-exec-muted">
                      Belum ada data.
                    </div>
                  ) : (
                    kinerja.map((k) => (
                      <div
                        key={k.key}
                        className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold">
                              {k.label}
                            </div>
                            <div className="text-xs text-exec-muted mt-1">
                              Total: {k.total} · Aktif: {k.aktif} · Terlambat:{" "}
                              {k.terlambat}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-extrabold">
                              {k.skor}
                            </div>
                            <div className="text-xs text-exec-muted">
                              {k.kategori}
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
    </div>
  );
}

