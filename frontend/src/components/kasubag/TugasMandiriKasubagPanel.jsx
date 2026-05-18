import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

// ─── Definisi Sifat Tugas per Prioritas ──────────────────────────────────────
// Deadline dihitung dari tanggal/waktu penugasan + aturan per sifat.
// Prioritas Tinggi → deadline presisi sampai jam (datetime).
// Normal & Rendah  → deadline cukup tanggal.
const SIFAT_BY_PRIORITY = {
  high: [
    {
      value: "sangat_mendesak",
      label: "Sangat Mendesak",
      desc: "Harus selesai hari ini (±2 jam kerja, maks jam 15:00)",
      addDays: 0, targetHour: 15, targetMin: 0,
      icon: "🔴",
    },
    {
      value: "mendesak",
      label: "Mendesak",
      desc: "Selesai sebelum akhir jam kerja hari ini (jam 17:00)",
      addDays: 0, targetHour: 17, targetMin: 0,
      icon: "🟠",
    },
    {
      value: "segera",
      label: "Segera",
      desc: "Diselesaikan besok pagi (jam 09:00)",
      addDays: 1, targetHour: 9, targetMin: 0,
      icon: "🟡",
    },
    {
      value: "prioritas_2hari",
      label: "Prioritas — 2 Hari Kerja",
      desc: "Diselesaikan dalam 2 hari kerja (jam 16:00)",
      addDays: 2, targetHour: 16, targetMin: 0,
      icon: "🔵",
    },
    {
      value: "prioritas_3hari",
      label: "Prioritas — 3 Hari Kerja",
      desc: "Diselesaikan dalam 3 hari kerja (jam 16:00)",
      addDays: 3, targetHour: 16, targetMin: 0,
      icon: "🟣",
    },
  ],
  normal: [
    {
      value: "rutin_harian",
      label: "Rutin Harian",
      desc: "Pekerjaan rutin harian — selesai besok",
      addDays: 1,
      icon: "📅",
    },
    {
      value: "koordinasi",
      label: "Koordinasi",
      desc: "Perlu koordinasi antar unit — 3 hari",
      addDays: 3,
      icon: "🤝",
    },
    {
      value: "rekap_data",
      label: "Rekap / Pengolahan Data",
      desc: "Pengumpulan dan rekap data — 5 hari",
      addDays: 5,
      icon: "📊",
    },
    {
      value: "pelaporan",
      label: "Pelaporan",
      desc: "Penyusunan laporan berkala — 7 hari",
      addDays: 7,
      icon: "📝",
    },
    {
      value: "penyusunan_dokumen",
      label: "Penyusunan Dokumen",
      desc: "Penyusunan naskah/dokumen resmi — 10 hari",
      addDays: 10,
      icon: "📄",
    },
  ],
  low: [
    {
      value: "administrasi_umum",
      label: "Administrasi Umum",
      desc: "Tugas administratif non-mendesak — 14 hari",
      addDays: 14,
      icon: "🗂️",
    },
    {
      value: "pengarsipan",
      label: "Pengarsipan",
      desc: "Pengarsipan dokumen fisik/digital — 14 hari",
      addDays: 14,
      icon: "📁",
    },
    {
      value: "monitoring_berkala",
      label: "Monitoring Berkala",
      desc: "Pantau kondisi/data secara berkala — 21 hari",
      addDays: 21,
      icon: "🔎",
    },
    {
      value: "evaluasi",
      label: "Evaluasi",
      desc: "Evaluasi program/kegiatan — 30 hari",
      addDays: 30,
      icon: "📈",
    },
  ],
};

const PRIORITAS_OPTIONS = [
  { value: "high",   label: "Tinggi",  color: "text-red-700",   bg: "bg-red-50"   },
  { value: "normal", label: "Normal",  color: "text-cyan-700",  bg: "bg-cyan-50"  },
  { value: "low",    label: "Rendah",  color: "text-slate-600", bg: "bg-slate-50" },
];

// ─── Utilitas waktu ───────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

function nowDatetimeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Untuk prioritas Tinggi: hitung datetime deadline
function calcDeadlineDatetime(baseDateStr, addDays, targetHour, targetMin) {
  const d = new Date(baseDateStr);
  d.setDate(d.getDate() + addDays);
  d.setHours(targetHour, targetMin, 0, 0);
  // Proteksi: jika hari ini & jam sudah terlewat → geser besok
  if (addDays === 0 && d <= new Date()) {
    d.setDate(d.getDate() + 1);
  }
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Untuk prioritas Normal/Rendah: hitung tanggal saja
function calcDeadlineDate(baseDateStr, addDays) {
  const d = new Date(baseDateStr);
  d.setDate(d.getDate() + addDays);
  return d.toISOString().slice(0, 10);
}

function buildRef(dateStr) {
  return `TGS/SEK/KSB/${dateStr.replace(/-/g, "")}`;
}

function fmtDatetime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) + " WIB";
}

function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── State awal ───────────────────────────────────────────────────────────────
function buildInitialForm() {
  const today = todayStr();
  return {
    title: "",
    description: "",
    output_diharapkan: "",
    assignee_user_id: "",
    priority: "normal",
    sifat_perintah: "",
    due_date: "",        // tanggal saja (normal/low)
    due_datetime: "",    // tanggal+jam (high)
    tanggal_penugasan: today,
    waktu_penugasan: nowDatetimeLocal(),
    referensi: buildRef(today),
    catatan: "",
  };
}

// ─── Komponen ─────────────────────────────────────────────────────────────────
export default function TugasMandiriKasubagPanel({ onTugasDibuat }) {
  const [anggota, setAnggota] = useState([]);
  const [anggotaLoading, setAnggotaLoading] = useState(true);
  const [form, setForm] = useState(buildInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [tugasHistory, setTugasHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const isHighPriority = form.priority === "high";
  const sifatList = SIFAT_BY_PRIORITY[form.priority] || [];
  const selectedSifat = sifatList.find((s) => s.value === form.sifat_perintah) || null;

  // Keterangan deadline yang sudah dihitung
  const deadlineDisplay = isHighPriority
    ? fmtDatetime(form.due_datetime)
    : fmtDate(form.due_date);

  const deadlineReady = isHighPriority ? !!form.due_datetime : !!form.due_date;

  // ─── Fetch data ───────────────────────────────────────────────────────────
  const loadAnggota = useCallback(async () => {
    setAnggotaLoading(true);
    try {
      const res = await api.get("/api/kasubag/tim/anggota");
      setAnggota(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setAnggota([]); }
    finally { setAnggotaLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/api/tasks", {
        params: { created_by: "me", module: "kepegawaian_umum", limit: 20 },
      });
      const all = Array.isArray(res.data?.data) ? res.data.data : [];
      setTugasHistory(all.filter((t) => t.metadata?.jenis_tugas === "mandiri"));
    } catch { setTugasHistory([]); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { loadAnggota(); loadHistory(); }, [loadAnggota, loadHistory]);

  // ─── Handler: ganti Prioritas ─────────────────────────────────────────────
  function handlePriorityChange(e) {
    setForm((prev) => ({
      ...prev,
      priority: e.target.value,
      sifat_perintah: "",
      due_date: "",
      due_datetime: "",
    }));
    setError(null); setSuccessMsg(null);
  }

  // ─── Handler: ganti Sifat Tugas ───────────────────────────────────────────
  function handleSifatChange(e) {
    const val = e.target.value;
    const sifat = (SIFAT_BY_PRIORITY[form.priority] || []).find((s) => s.value === val);
    const base = form.tanggal_penugasan || todayStr();

    let due_date = "";
    let due_datetime = "";

    if (sifat) {
      if (form.priority === "high") {
        due_datetime = calcDeadlineDatetime(base, sifat.addDays, sifat.targetHour, sifat.targetMin);
      } else {
        due_date = calcDeadlineDate(base, sifat.addDays);
      }
    }

    setForm((prev) => ({ ...prev, sifat_perintah: val, due_date, due_datetime }));
    setError(null); setSuccessMsg(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null); setSuccessMsg(null);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setSuccessMsg(null);

    if (!form.title.trim()) return setError("Judul tugas wajib diisi.");
    if (!form.assignee_user_id) return setError("Pilih pelaksana terlebih dahulu.");
    if (!form.sifat_perintah) return setError("Pilih sifat tugas untuk menentukan deadline.");
    if (!deadlineReady) return setError("Deadline belum terhitung. Pastikan sifat tugas sudah dipilih.");

    const due_date_sent = isHighPriority ? form.due_datetime : form.due_date;

    setSubmitting(true);
    try {
      const res = await api.post("/api/kasubag/tugas-mandiri", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        output_diharapkan: form.output_diharapkan.trim() || null,
        assignee_user_id: Number(form.assignee_user_id),
        due_date: due_date_sent,
        tanggal_penugasan: form.tanggal_penugasan,
        waktu_penugasan: form.waktu_penugasan,
        priority: form.priority,
        sifat_perintah: form.sifat_perintah,
        referensi: form.referensi || null,
        catatan: form.catatan.trim() || null,
      });

      const nama =
        anggota.find((a) => String(a.id) === String(form.assignee_user_id))
          ?.nama_lengkap || "Pelaksana";
      setSuccessMsg(res.data?.message || `Tugas berhasil dibuat dan ditugaskan ke ${nama}`);
      setForm(buildInitialForm());
      loadHistory();
      if (onTugasDibuat) onTugasDibuat(res.data?.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal membuat tugas. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPelaksana = anggota.find(
    (a) => String(a.id) === String(form.assignee_user_id),
  );

  const StatusBadge = ({ status }) => {
    const map = {
      draft:                 ["bg-gray-100 text-gray-600",    "Draft"],
      assigned:              ["bg-blue-100 text-blue-700",    "Ditugaskan"],
      accepted:              ["bg-cyan-100 text-cyan-700",    "Diterima"],
      in_progress:           ["bg-amber-100 text-amber-700",  "Dikerjakan"],
      submitted:             ["bg-orange-100 text-orange-700","Menunggu Verif."],
      verified:              ["bg-emerald-100 text-emerald-700","Terverifikasi"],
      returned_to_pelaksana: ["bg-red-100 text-red-700",      "Dikembalikan"],
      closed:                ["bg-slate-100 text-slate-600",  "Selesai"],
    };
    const [cls, label] = map[status] || ["bg-gray-100 text-gray-500", status];
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
        {label}
      </span>
    );
  };

  // Warna aksen berdasarkan prioritas
  const accentRing = isHighPriority
    ? "focus:ring-red-400"
    : form.priority === "normal"
      ? "focus:ring-cyan-400"
      : "focus:ring-slate-400";

  const submitBtnClass = isHighPriority
    ? "bg-red-600 hover:bg-red-700"
    : form.priority === "normal"
      ? "bg-cyan-600 hover:bg-cyan-700"
      : "bg-slate-600 hover:bg-slate-700";

  return (
    <div className="space-y-6">

      {/* ── Form ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-cyan-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">
            📝 Buat Tugas Mandiri ke Pelaksana
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tugas dibuat langsung oleh Kasubag — tanpa perintah Sekretaris.&ensp;
            <span className="font-mono text-cyan-700">
              draft → assigned → accepted → in_progress → submitted → verified
            </span>
          </p>
        </div>

        {anggotaLoading ? (
          <div className="p-6 text-sm text-gray-400 animate-pulse">Memuat daftar pelaksana…</div>
        ) : anggota.length === 0 ? (
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-semibold">Belum ada bawahan langsung</p>
              <p className="text-xs text-amber-700 mt-1">
                Relasi atasan–bawahan (<span className="font-mono">user_hierarchy</span>) untuk
                akun Anda belum dikonfigurasi. Hubungi admin sistem.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* ── Baris 1: Waktu Penugasan (auto) + Nomor Referensi (auto) ────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal &amp; Jam Penugasan
                  <span className="ml-1 text-[10px] font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                    otomatis
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={form.waktu_penugasan}
                  readOnly tabIndex={-1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  {fmtDatetime(form.waktu_penugasan)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Referensi
                  <span className="ml-1 text-[10px] font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                    otomatis
                  </span>
                </label>
                <input
                  type="text"
                  value={form.referensi}
                  readOnly tabIndex={-1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* ── Baris 2: Prioritas (dropdown) + Sifat Tugas (dropdown) ───────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prioritas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prioritas Tugas <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handlePriorityChange}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${accentRing}`}
                >
                  {PRIORITAS_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {form.priority === "high" && "Deadline presisi sampai jam, berdasarkan sifat tugas."}
                  {form.priority === "normal" && "Deadline otomatis dihitung berdasarkan sifat tugas."}
                  {form.priority === "low" && "Deadline otomatis dihitung berdasarkan sifat tugas."}
                </p>
              </div>

              {/* Sifat Tugas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sifat Perintah / Tugas <span className="text-red-500">*</span>
                </label>
                <select
                  name="sifat_perintah"
                  value={form.sifat_perintah}
                  onChange={handleSifatChange}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${accentRing}`}
                >
                  <option value="">— Pilih Sifat Tugas —</option>
                  {sifatList.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
                {selectedSifat && (
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    {selectedSifat.desc}
                  </p>
                )}
              </div>
            </div>

            {/* ── Deadline hasil kalkulasi ──────────────────────────────────────── */}
            {deadlineReady && (
              <div className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
                isHighPriority
                  ? "bg-red-50 border-red-200"
                  : form.priority === "normal"
                    ? "bg-cyan-50 border-cyan-200"
                    : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-semibold uppercase tracking-wide mb-0.5 ${
                    isHighPriority ? "text-red-600"
                      : form.priority === "normal" ? "text-cyan-600"
                        : "text-slate-500"
                  }`}>
                    {isHighPriority ? "⚡ Deadline (presisi jam)" : "📅 Deadline"}
                  </p>
                  <p className={`text-sm font-bold ${
                    isHighPriority ? "text-red-900"
                      : form.priority === "normal" ? "text-cyan-900"
                        : "text-slate-700"
                  }`}>
                    {deadlineDisplay}
                  </p>
                  {selectedSifat && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {selectedSifat.icon} {selectedSifat.label}
                      {isHighPriority
                        ? ` — ${selectedSifat.addDays === 0 ? "hari ini" : `+${selectedSifat.addDays} hari`} jam ${pad(selectedSifat.targetHour)}:${pad(selectedSifat.targetMin)}`
                        : ` — +${selectedSifat.addDays} hari dari tanggal penugasan`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder saat sifat belum dipilih */}
            {!deadlineReady && form.sifat_perintah === "" && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs text-gray-400 italic">
                  Deadline akan dihitung otomatis setelah Sifat Tugas dipilih.
                </p>
              </div>
            )}

            {/* ── Judul Tugas ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Judul / Nama Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Rekap Absensi Pegawai Bulan April 2026"
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${accentRing}`}
                required
              />
            </div>

            {/* ── Pilih Pelaksana ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ditugaskan Kepada <span className="text-red-500">*</span>
              </label>
              <select
                name="assignee_user_id"
                value={form.assignee_user_id}
                onChange={handleChange}
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${accentRing}`}
                required
              >
                <option value="">— Pilih Pelaksana —</option>
                {anggota.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama_lengkap}{a.jabatan ? ` — ${a.jabatan}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Agenda / Deskripsi ───────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Agenda / Deskripsi Tugas
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan apa yang harus dilakukan pelaksana…"
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${accentRing} resize-none`}
              />
            </div>

            {/* ── Output yang Diharapkan ───────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Output yang Diharapkan
              </label>
              <input
                type="text"
                name="output_diharapkan"
                value={form.output_diharapkan}
                onChange={handleChange}
                placeholder="Contoh: Laporan rekap absensi dalam format Excel"
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${accentRing}`}
              />
            </div>

            {/* ── Catatan ──────────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan Khusus untuk Pelaksana
              </label>
              <input
                type="text"
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                placeholder="Catatan tambahan yang perlu diketahui pelaksana…"
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${accentRing}`}
              />
            </div>

            {/* ── Preview Ringkasan ────────────────────────────────────────────── */}
            {form.title && form.assignee_user_id && deadlineReady && (
              <div className={`rounded-lg border px-4 py-3 text-xs space-y-1 ${
                isHighPriority
                  ? "bg-red-50 border-red-200 text-red-800"
                  : form.priority === "normal"
                    ? "bg-cyan-50 border-cyan-200 text-cyan-800"
                    : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <p className="font-bold text-sm mb-1">
                  {isHighPriority ? "🔴" : form.priority === "normal" ? "📋" : "📁"} Ringkasan Surat Tugas
                </p>
                <p>
                  Tugas &ldquo;<strong>{form.title}</strong>&rdquo; diberikan kepada{" "}
                  <strong>{selectedPelaksana?.nama_lengkap || "—"}</strong>
                </p>
                <p>Ditugaskan: <strong>{fmtDatetime(form.waktu_penugasan)}</strong></p>
                <p>Deadline: <strong>{deadlineDisplay}</strong></p>
                <p>Sifat: <strong>{selectedSifat?.label || "—"}</strong></p>
                <p>Ref: <span className="font-mono">{form.referensi}</span></p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-semibold">
                ✓ {successMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-gray-400">
                Tugas langsung masuk ke dashboard pelaksana yang dipilih.
              </p>
              <button
                type="submit"
                disabled={submitting || !deadlineReady || !form.sifat_perintah}
                className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40 ${submitBtnClass}`}
              >
                {submitting ? "Mengirim…" : "Buat & Tugaskan"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Riwayat ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base">📋 Riwayat Tugas Mandiri</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tugas yang pernah Anda buat langsung ke pelaksana
            </p>
          </div>
          <button onClick={loadHistory} className="text-xs text-cyan-600 hover:underline font-semibold">
            Muat ulang
          </button>
        </div>
        <div className="p-5">
          {historyLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Memuat riwayat…</p>
          ) : tugasHistory.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Belum ada tugas mandiri yang dibuat.</p>
          ) : (
            <div className="space-y-2">
              {tugasHistory.map((t) => {
                const sifatVal = t.metadata?.sifat_perintah;
                const sifatLabel =
                  Object.values(SIFAT_BY_PRIORITY)
                    .flat()
                    .find((s) => s.value === sifatVal)?.label || sifatVal;
                const deadline = t.due_date
                  ? new Date(t.due_date).toLocaleString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "—";
                return (
                  <div
                    key={t.id}
                    className="border border-gray-100 bg-slate-50 rounded-lg p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {t.priority === "high" && <span className="text-red-500 mr-1">🔴</span>}
                        {t.title || `Tugas #${t.id}`}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Ref: {t.metadata?.referensi || `#${t.id}`} · Deadline: {deadline}
                      </div>
                      {sifatLabel && (
                        <div className="text-[11px] text-gray-500">Sifat: {sifatLabel}</div>
                      )}
                    </div>
                    <StatusBadge status={t.status} />
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
