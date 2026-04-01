import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";
import { roleIdToName } from "../../utils/roleMap";
import MapLayerPanel from "../../components/ui/MapLayerPanel";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardGubernur() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  if (!user || roleName !== "gubernur") {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Silakan login sebagai Gubernur untuk mengakses dashboard ini.</div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [instruksi, setInstruksi] = useState([]);
  const [pengajuan, setPengajuan] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [briefing, setBriefing] = useState(null);

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

  const tiles = useMemo(() => {
    const s = summary || {};
    return [
      {
        label: "Perintah Aktif",
        value: s.perintah_aktif ?? "—",
        hint: "Instruksi diterbitkan/dibaca/diproses/terlambat",
      },
      {
        label: "Menunggu Approval",
        value: s.menunggu_approval ?? "—",
        hint: "Pengajuan dari Kepala Dinas (diajukan/dalam review)",
      },
      {
        label: "Alert Kritis",
        value: s.alert_kritis ?? "—",
        hint: "Alert/Deadline dekat (unread)",
      },
      {
        label: "SLA%",
        value: typeof s.sla_persen === "number" ? `${s.sla_persen}%` : "—",
        hint: "MVP (agregat awal)",
      },
    ];
  }, [summary]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [a, b, c, d, e] = await Promise.all([
        api.get(`${base}/dashboard/summary`),
        api.get(`${base}/instruksi?limit=25`),
        api.get(`${base}/pengajuan?limit=25`),
        api.get(`${base}/notifikasi?limit=25`),
        api.get(`${base}/dashboard/briefing-harian`),
      ]);
      setSummary(a.data?.data || null);
      setInstruksi(b.data?.data || []);
      setPengajuan(c.data?.data || []);
      setNotifikasi(d.data?.data || []);
      setBriefing(e.data?.data || null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Gagal memuat dashboard Gubernur",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitInstruksi() {
    try {
      if (
        !form.judul ||
        !form.isi_perintah ||
        !form.jenis ||
        !form.assigned_to
      ) {
        toast.error(
          "Lengkapi: judul, isi, jenis, assigned_to (user id Kepala Dinas)",
        );
        return;
      }
      await api.post(`${base}/instruksi`, {
        judul: form.judul,
        isi_perintah: form.isi_perintah,
        jenis: form.jenis,
        prioritas: form.prioritas,
        deadline: form.deadline || null,
        lampiran_url: form.lampiran_url || null,
        assigned_to: Number(form.assigned_to),
      });
      toast.success("Instruksi dibuat (status draf)");
      setForm((p) => ({
        ...p,
        judul: "",
        isi_perintah: "",
        deadline: "",
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

  async function putuskanPengajuan(id, keputusan) {
    try {
      const catatan =
        keputusan === "setuju"
          ? ""
          : window.prompt("Catatan wajib (tolak/kembalikan):", "") || "";
      if ((keputusan === "tolak" || keputusan === "kembalikan") && !catatan)
        return;
      await api.post(`${base}/pengajuan/${id}/putuskan`, {
        keputusan,
        catatan,
      });
      toast.success("Keputusan tersimpan");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memutuskan pengajuan");
    }
  }

  return (
    <div className="min-h-[100dvh] w-full min-w-0 bg-gradient-to-br from-exec-canvas via-white to-exec-canvas2 text-exec-ink antialiased">
      <div className="w-full max-w-[100vw] mx-auto box-border px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 pb-12">
        {/* Header */}
        <div className="relative rounded-2xl border border-exec-border bg-white/95 shadow-exec mb-6 p-5 sm:p-6 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-teal-500 via-teal-400 to-rose-400"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-4 flex-wrap pl-2 sm:pl-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                Pemerintah Provinsi Maluku Utara
              </div>
              <div className="text-sm text-exec-muted mt-1">Selamat datang</div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-exec-ink">
                Ibu Gubernur
              </div>
              <div className="text-sm font-medium text-teal-800/90 mt-0.5">
                Sherly Tjoanda
              </div>
              <div className="text-sm text-exec-muted mt-2 max-w-2xl leading-relaxed">
                Command Center eksekutif — instruksi, approval, peta, dan
                notifikasi. Tampilan dioptimalkan untuk layar penuh di desktop,
                laptop, tablet, dan ponsel.
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-exec-muted">Login sebagai</div>
              <div className="text-sm font-semibold text-exec-ink">
                {user?.nama_lengkap || user?.username || "Gubernur"}
              </div>
            </div>
          </div>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-exec-border bg-gradient-to-br from-white via-teal-50/40 to-rose-50/35 p-4 shadow-sm ring-1 ring-teal-100/40"
            >
              <div className="text-xs text-exec-muted font-medium">{t.label}</div>
              <div className="text-2xl font-extrabold mt-1 text-teal-900 tabular-nums">
                {t.value}
              </div>
              <div className="text-[11px] text-exec-muted mt-1">{t.hint}</div>
            </div>
          ))}
        </div>

        {/* Row: Map + Inbox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
              <div className="font-semibold">Peta Ketahanan Pangan (MVP)</div>
              <div className="text-xs text-exec-muted">
                Drill-down akan ditingkatkan
              </div>
            </div>
            <div className="p-4">
              <MapLayerPanel title="Maluku Utara — Kerawanan / Stok / Distribusi" />
            </div>
          </div>

          <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
              <div className="font-semibold">Inbox Gubernur — Pengajuan</div>
              <div className="text-xs text-exec-muted">
                {pengajuan?.length || 0} item
              </div>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-sm text-exec-muted">Memuat...</div>
              ) : pengajuan.length === 0 ? (
                <div className="text-sm text-exec-muted">
                  Tidak ada pengajuan.
                </div>
              ) : (
                pengajuan.slice(0, 8).map((p) => (
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
                          Jenis: {p.jenis} · Status:{" "}
                          <span className="font-medium text-exec-ink">
                            {p.status}
                          </span>{" "}
                          · Revisi: {p.revisi_ke || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => putuskanPengajuan(p.id, "setuju")}
                          className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => putuskanPengajuan(p.id, "kembalikan")}
                          className="px-3 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-700"
                        >
                          Kembalikan
                        </button>
                        <button
                          onClick={() => putuskanPengajuan(p.id, "tolak")}
                          className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-700"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                    {p.catatan_gubernur ? (
                      <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                        Catatan: {p.catatan_gubernur}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Row: Monitor Instruksi + Briefing/Notifikasi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between">
              <div className="font-semibold">Monitor Instruksi Gubernur</div>
              <div className="text-xs text-exec-muted">
                {instruksi?.length || 0} item
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4">
                <div className="text-sm font-semibold mb-3">
                  Buat Instruksi (draf)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">Judul</label>
                    <input
                      value={form.judul}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, judul: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                      placeholder="Instruksi / arahan strategis..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">
                      Assigned To (User ID Kepala Dinas)
                    </label>
                    <input
                      value={form.assigned_to}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, assigned_to: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                      placeholder="contoh: 2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">Jenis</label>
                    <select
                      value={form.jenis}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, jenis: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                    >
                      <option value="instruksi">Instruksi</option>
                      <option value="disposisi">Disposisi</option>
                      <option value="arahan_strategis">Arahan Strategis</option>
                      <option value="minta_laporan">Permintaan Laporan</option>
                      <option value="tanggap_darurat">Tanggap Darurat</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">Prioritas</label>
                    <select
                      value={form.prioritas}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, prioritas: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                    >
                      <option value="normal">Normal</option>
                      <option value="tinggi">Tinggi</option>
                      <option value="mendesak">Mendesak</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">Deadline</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, deadline: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">
                      Lampiran URL (opsional)
                    </label>
                    <input
                      value={form.lampiran_url}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lampiran_url: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm text-exec-ink shadow-inner"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-xs text-exec-muted">
                      Isi Perintah
                    </label>
                    <textarea
                      value={form.isi_perintah}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isi_perintah: e.target.value }))
                      }
                      className="rounded-lg bg-white border border-exec-border px-3 py-2 text-sm min-h-[96px] text-exec-ink shadow-inner"
                      placeholder="Tuliskan isi instruksi..."
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={refreshAll}
                    className="px-3 py-2 text-xs rounded-lg border border-exec-border hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={submitInstruksi}
                    className="px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700"
                  >
                    Simpan Draf
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-sm text-exec-muted">Memuat...</div>
              ) : instruksi.length === 0 ? (
                <div className="text-sm text-exec-muted">
                  Belum ada instruksi.
                </div>
              ) : (
                instruksi.slice(0, 8).map((x) => (
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
                          Jenis: {x.jenis} · Prioritas: {x.prioritas} · Status:{" "}
                          <span className="font-medium text-exec-ink">
                            {x.status}
                          </span>
                        </div>
                      </div>
                      {x.status === "draf" ? (
                        <button
                          onClick={() => terbitkanInstruksi(x.id)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-sky-600 hover:bg-sky-700"
                        >
                          Terbitkan
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs text-exec-muted whitespace-pre-wrap">
                      {x.isi_perintah}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-exec-border">
              <div className="font-semibold">Notifikasi & Briefing</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4">
                <div className="text-sm font-semibold">Briefing Harian</div>
                <div className="text-xs text-exec-muted mt-1">
                  {briefing?.tanggal || "—"}
                </div>
                <div className="text-sm text-exec-ink mt-2">
                  {briefing?.ringkas || "—"}
                </div>
                {Array.isArray(briefing?.highlight) ? (
                  <ul className="mt-2 text-xs text-exec-muted list-disc pl-5 space-y-1">
                    {briefing.highlight.slice(0, 5).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="rounded-xl border border-exec-border bg-gradient-to-br from-rose-50/40 to-teal-50/35 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Feed Notifikasi</div>
                  <div className="text-xs text-exec-muted">
                    {notifikasi?.length || 0} item
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {loading ? (
                    <div className="text-sm text-exec-muted">Memuat...</div>
                  ) : notifikasi.length === 0 ? (
                    <div className="text-sm text-exec-muted">
                      Belum ada notifikasi.
                    </div>
                  ) : (
                    notifikasi.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg border border-exec-border bg-white/95 shadow-sm p-3"
                      >
                        <div className="text-xs text-exec-muted">
                          {n.jenis} · {n.sudah_dibaca ? "dibaca" : "baru"}
                        </div>
                        <div className="text-sm font-semibold">{n.judul}</div>
                        {n.isi ? (
                          <div className="text-xs text-exec-muted mt-1 whitespace-pre-wrap">
                            {n.isi}
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
      </div>
    </div>
  );
}
