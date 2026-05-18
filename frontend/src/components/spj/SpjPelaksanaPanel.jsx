/**
 * SpjPelaksanaPanel.jsx
 *
 * Panel SPJ untuk Pelaksana / PPTK.
 * Mendukung:
 * - Kondisi A (Mandiri): buat SPJ untuk dirinya sendiri
 * - Kondisi B (Delegasi): buat draft SPJ atas nama pejabat (hanya PPTK)
 *
 * Sesuai dokumen 41 — Pedoman Mekanisme SPJ Mandiri dan Delegasi.
 */
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import useAuthStore from "../../stores/authStore";
import SpjStatusBadge from "./SpjStatusBadge";

const JENIS_BELANJA_OPT = [
  { value: "honor", label: "Honor / Uang Saku" },
  { value: "perjalanan_dinas", label: "Perjalanan Dinas" },
  { value: "atk", label: "ATK & Bahan Habis Pakai" },
  { value: "makan_minum", label: "Makan & Minum Rapat" },
  { value: "fotokopi", label: "Fotokopi & Cetak" },
  { value: "transport", label: "Transport Lokal" },
  { value: "lainnya", label: "Lainnya" },
];

// Jenis dokumen lampiran per jenis belanja (saran otomatis)
const JENIS_DOK_OPT = [
  { value: "kwitansi", label: "Kwitansi / Nota Pembayaran" },
  { value: "sppd", label: "SPPD (Surat Perintah Perjalanan Dinas)" },
  { value: "laporan_perjalanan", label: "Laporan Perjalanan Dinas" },
  { value: "surat_tugas", label: "Surat Tugas / Undangan" },
  { value: "daftar_hadir", label: "Daftar Hadir / Absen" },
  { value: "berita_acara", label: "Berita Acara Kegiatan" },
  { value: "foto_dokumentasi", label: "Foto Dokumentasi Kegiatan" },
  { value: "nota_dinas", label: "Nota Dinas" },
  { value: "bukti_transfer", label: "Bukti Transfer / Setoran" },
  { value: "lainnya", label: "Dokumen Lainnya" },
];

// Saran lampiran per jenis belanja agar ASN dipandu
const LAMPIRAN_SARAN = {
  perjalanan_dinas: ["sppd", "kwitansi", "laporan_perjalanan"],
  honor: ["surat_tugas", "daftar_hadir", "kwitansi"],
  atk: ["kwitansi", "nota_dinas"],
  makan_minum: ["kwitansi", "berita_acara", "daftar_hadir"],
  fotokopi: ["kwitansi"],
  transport: ["kwitansi", "sppd"],
  lainnya: ["kwitansi", "nota_dinas"],
};

// Serialisasi lampiran → simpan sebagai JSON string di backend
function serializeLampiran(list) {
  const valid = list.filter((d) => d.url.trim());
  if (valid.length === 0) return "";
  if (valid.length === 1 && !valid[0].jenis && !valid[0].label) return valid[0].url.trim();
  return JSON.stringify(valid.map((d) => ({ jenis: d.jenis, label: d.label.trim(), url: d.url.trim() })));
}

// Deserialisasi lampiran dari DB (plain URL atau JSON)
function parseLampiran(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [{ jenis: "lainnya", label: "Lampiran", url: raw }];
  } catch {
    return [{ jenis: "lainnya", label: "Lampiran", url: raw }];
  }
}

// ── Komponen input satu baris lampiran ─────────────────────────────────────
function LampiranRow({ idx, entry, onChange, onRemove, showRemove }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={entry.jenis}
          onChange={(e) => onChange(idx, "jenis", e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="">— Jenis Dokumen —</option>
          {JENIS_DOK_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="text"
          value={entry.label}
          onChange={(e) => onChange(idx, "label", e.target.value)}
          placeholder="Judul / keterangan singkat"
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <div className="flex gap-1">
          <input
            type="url"
            value={entry.url}
            onChange={(e) => onChange(idx, "url", e.target.value)}
            placeholder="https://drive.google.com/…"
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer"
              className="px-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs transition" title="Buka di tab baru">
              🔗
            </a>
          )}
        </div>
      </div>
      {showRemove && (
        <button type="button" onClick={() => onRemove(idx)}
          className="mt-1 text-red-400 hover:text-red-600 text-xs px-1 py-1 rounded transition shrink-0">✕</button>
      )}
    </div>
  );
}

// ── Komponen panel lampiran multi-dokumen ───────────────────────────────────
function LampiranPanel({ value, onChange, jenisBelanja }) {
  const saran = LAMPIRAN_SARAN[jenisBelanja] || [];
  const hasAnySuggestion = saran.length > 0 && value.every((v) => !v.url);

  function updateRow(idx, key, val) {
    const updated = value.map((r, i) => i === idx ? { ...r, [key]: val } : r);
    onChange(updated);
  }
  function removeRow(idx) { onChange(value.filter((_, i) => i !== idx)); }
  function addRow() { onChange([...value, { jenis: "", label: "", url: "" }]); }

  function applyTemplate() {
    const rows = saran.map((j) => {
      const opt = JENIS_DOK_OPT.find((o) => o.value === j);
      return { jenis: j, label: opt?.label || j, url: "" };
    });
    onChange(rows);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          Bukti & Lampiran Dokumen <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {hasAnySuggestion && saran.length > 0 && (
            <button type="button" onClick={applyTemplate}
              className="text-[11px] text-cyan-600 hover:text-cyan-800 border border-cyan-200 rounded-full px-2 py-0.5 bg-cyan-50 hover:bg-cyan-100 transition">
              ✨ Isi template untuk {jenisBelanja?.replace(/_/g, " ") || "jenis ini"}
            </button>
          )}
          <button type="button" onClick={addRow}
            className="text-[11px] text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 transition">
            + Tambah Dokumen
          </button>
        </div>
      </div>

      {/* Panduan jenis lampiran yang disarankan */}
      {saran.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
          <span className="font-semibold">📎 Dokumen yang lazim untuk {jenisBelanja?.replace(/_/g, " ")}:</span>{" "}
          {saran.map((j) => JENIS_DOK_OPT.find((o) => o.value === j)?.label || j).join(" · ")}
        </div>
      )}

      <div className="space-y-2">
        {value.map((entry, idx) => (
          <LampiranRow
            key={idx}
            idx={idx}
            entry={entry}
            onChange={updateRow}
            onRemove={removeRow}
            showRemove={value.length > 1}
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-400">
        Tempel link Google Drive, Google Docs, atau URL dokumen digital lainnya. Pastikan dokumen dapat diakses oleh Bendahara dan PPK.
      </p>
    </div>
  );
}

function fmt(tgl) {
  if (!tgl) return "—";
  return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRp(val) {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

// ── Form tambah SPJ ────────────────────────────────────────────────────────
function SpjForm({ kondisi, pejabatList, pejabatMeta, onSuccess, onCancel }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    jenis_kondisi: kondisi,
    atas_nama_pejabat_id: "",
    jenis_belanja: "",
    sub_kegiatan_kode: "SEKRETARIAT",
    kode_rekening: "5.2.2.11.01",
    nominal: "",
    tanggal_kegiatan: new Date().toISOString().slice(0, 10),
    keterangan: "",
    uraian_kegiatan: "",
  });
  const [lampiranList, setLampiranList] = useState([{ jenis: "", label: "", url: "" }]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (kondisi === "delegasi" && !form.atas_nama_pejabat_id) {
      setErr("Pilih pejabat yang akan dibuatkan SPJ-nya.");
      return;
    }
    if (!form.jenis_belanja) { setErr("Pilih jenis belanja."); return; }
    if (!form.nominal || Number(form.nominal) <= 0) { setErr("Isi nominal yang valid."); return; }
    const serialized = serializeLampiran(lampiranList);
    if (!serialized) { setErr("Minimal satu lampiran/bukti wajib disertakan."); return; }

    setLoading(true);
    setErr(null);
    try {
      const endpoint = kondisi === "delegasi" ? "/spj/delegasi" : "/spj/saya";
      const payload = {
        ...form,
        nominal: Number(form.nominal),
        lampiran_url: serialized,
        pptk_id: kondisi === "delegasi" ? user?.id : undefined,
      };
      await api.post(endpoint, payload);
      onSuccess?.();
    } catch (e) {
      setErr(e.response?.data?.message || "Gagal menyimpan SPJ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Kondisi B: pilih pejabat */}
      {kondisi === "delegasi" && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Pejabat yang Dibuatkan SPJ <span className="text-red-500">*</span>
          </label>
          <select
            value={form.atas_nama_pejabat_id}
            onChange={(e) => set("atas_nama_pejabat_id", e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">— Pilih Pejabat —</option>
            {pejabatList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_lengkap} · {p.jabatan || p.unit_kerja || ""}
              </option>
            ))}
          </select>
          {pejabatMeta?.filtered && pejabatMeta.unit_kerja_pptk && (
            <p className="text-[11px] text-cyan-700 mt-1">
              🔍 Menampilkan {pejabatMeta.total} pejabat dari unit: <strong>{pejabatMeta.unit_kerja_pptk}</strong>
            </p>
          )}
          {!pejabatMeta?.filtered && pejabatList.length > 0 && (
            <p className="text-[11px] text-orange-600 mt-1">
              ⚠️ Unit kerja tidak dapat dideteksi otomatis — menampilkan semua pejabat. Hubungi admin untuk memperbarui data unit kerja Anda.
            </p>
          )}
          <p className="text-[11px] text-amber-600 mt-1">
            ⚠️ Pejabat ini wajib mengkonfirmasi draft sebelum SPJ dapat diproses ke Bendahara.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Belanja <span className="text-red-500">*</span></label>
          <select
            value={form.jenis_belanja}
            onChange={(e) => set("jenis_belanja", e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">— Pilih —</option>
            {JENIS_BELANJA_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Kegiatan <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={form.tanggal_kegiatan}
            onChange={(e) => set("tanggal_kegiatan", e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nominal (Rp) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0"
            value={form.nominal}
            onChange={(e) => set("nominal", e.target.value)}
            placeholder="Contoh: 1500000"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Rekening</label>
          <input
            type="text"
            value={form.kode_rekening}
            onChange={(e) => set("kode_rekening", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Uraian Kegiatan</label>
        <textarea
          value={form.uraian_kegiatan}
          onChange={(e) => set("uraian_kegiatan", e.target.value)}
          rows={2}
          placeholder="Uraian singkat kegiatan yang dipertanggungjawabkan…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
        />
      </div>

      {/* Panel lampiran multi-dokumen */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <LampiranPanel
          value={lampiranList}
          onChange={setLampiranList}
          jenisBelanja={form.jenis_belanja}
        />
      </div>

      {err && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
        >
          {loading ? "Menyimpan…" : kondisi === "delegasi" ? "💾 Simpan Draft Delegasi" : "💾 Buat SPJ Draft"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

// ── Item baris SPJ ─────────────────────────────────────────────────────────
function SpjRow({ item, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function doSubmit() {
    setLoading("submit");
    setMsg(null);
    try {
      const ep = item.jenis_kondisi === "delegasi" ? `/spj/delegasi/${item.id}/submit` : `/spj/saya/${item.id}/submit`;
      await api.post(ep);
      setMsg({ ok: true, text: "Dikirim ke Bendahara Pengeluaran." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal submit." });
    } finally {
      setLoading(null);
    }
  }

  async function doFinalisasi() {
    setLoading("finalisasi");
    setMsg(null);
    try {
      await api.post(`/spj/delegasi/${item.id}/finalisasi`);
      setMsg({ ok: true, text: "Draft dikirim ke pejabat untuk konfirmasi." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal finalisasi." });
    } finally {
      setLoading(null);
    }
  }

  const isEditable = ["draft", "draft_delegasi", "ditolak_pejabat", "dikembalikan_bendahara", "dikembalikan_ppk"].includes(item.status);
  const canSubmitToBendahara = ["draft", "dikonfirmasi_pejabat", "dikembalikan_bendahara"].includes(item.status);
  const canFinalisasi = ["draft_delegasi", "ditolak_pejabat"].includes(item.status);

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SpjStatusBadge status={item.status} />
            {item.jenis_kondisi === "delegasi" && (
              <span className="text-[10px] bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-semibold">
                DELEGASI
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-gray-800 mt-1 truncate">
            {item.nomor_spj || `SPJ #${item.id}`} — {item.jenis_belanja?.replace(/_/g, " ")}
          </p>
          <div className="flex gap-3 text-[11px] text-gray-500 mt-0.5 flex-wrap">
            <span>{fmt(item.tanggal_kegiatan)}</span>
            <span className="font-semibold text-gray-700">{fmtRp(item.nominal)}</span>
            {item.revisi_ke > 0 && <span className="text-orange-500">Revisi ke-{item.revisi_ke}</span>}
          </div>
        </div>
        <span className="text-gray-400 text-sm shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {item.uraian_kegiatan && (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              {item.uraian_kegiatan}
            </p>
          )}

          {/* Tampilan lampiran multi-dokumen */}
          {item.lampiran_url && (() => {
            const docs = parseLampiran(item.lampiran_url);
            if (!docs.length) return null;
            return (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  📎 Lampiran Bukti ({docs.length} dokumen)
                </div>
                <div className="divide-y divide-slate-100">
                  {docs.map((d, i) => {
                    const jenisDok = JENIS_DOK_OPT.find((o) => o.value === d.jenis);
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2">
                        <span className="text-[10px] bg-cyan-100 text-cyan-700 rounded-full px-2 py-0.5 shrink-0 font-semibold">
                          {jenisDok?.label || d.jenis || "Dokumen"}
                        </span>
                        {d.label && <span className="text-xs text-gray-600 flex-1 truncate">{d.label}</span>}
                        {d.url && (
                          <a href={d.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-cyan-600 hover:text-cyan-800 underline shrink-0">
                            Buka →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {item.catatan_bendahara && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
              <span className="font-semibold">Catatan Bendahara:</span> {item.catatan_bendahara}
            </div>
          )}
          {item.catatan_ppk && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Catatan PPK:</span> {item.catatan_ppk}
            </div>
          )}
          {item.catatan_penolakan_pejabat && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Alasan Penolakan Pejabat:</span> {item.catatan_penolakan_pejabat}
            </div>
          )}
          {item.nomor_spm && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700">
              <span className="font-semibold">SPM Diterbitkan:</span> {item.nomor_spm} — {fmt(item.tanggal_spm)}
            </div>
          )}
          {item.deadline_konfirmasi && item.status === "menunggu_konfirmasi_pejabat" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
              ⏰ Deadline konfirmasi pejabat: <strong>{fmt(item.deadline_konfirmasi)}</strong>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {canFinalisasi && (
              <button
                onClick={doFinalisasi}
                disabled={!!loading}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition"
              >
                {loading === "finalisasi" ? "Memproses…" : "📤 Kirim ke Pejabat untuk Konfirmasi"}
              </button>
            )}
            {canSubmitToBendahara && (
              <button
                onClick={doSubmit}
                disabled={!!loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition"
              >
                {loading === "submit" ? "Memproses…" : "📨 Kirim ke Bendahara"}
              </button>
            )}
          </div>

          {msg && (
            <p className={`text-xs font-semibold px-3 py-2 rounded-lg border ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel utama ────────────────────────────────────────────────────────────
export default function SpjPelaksanaPanel() {
  const user = useAuthStore((s) => s.user);
  const isPptk = String(user?.jabatan || "").toUpperCase().includes("PPTK");

  const [tab, setTab] = useState("list");
  const [kondisiForm, setKondisiForm] = useState("mandiri");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [pejabatList, setPejabatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/spj/saya", { params: { limit: 50 } }),
      api.get("/spj/saya/stats"),
    ])
      .then(([listRes, statsRes]) => {
        setRows(Array.isArray(listRes.data?.data) ? listRes.data.data : []);
        setStats(statsRes.data?.data || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [pejabatMeta, setPejabatMeta] = useState({ filtered: false, unit_kerja_pptk: "", total: 0 });

  const loadPejabat = useCallback(() => {
    if (!isPptk) return;
    api.get("/spj/pejabat-eligible")
      .then((r) => {
        setPejabatList(Array.isArray(r.data?.data) ? r.data.data : []);
        setPejabatMeta({
          filtered: r.data?.filtered ?? false,
          unit_kerja_pptk: r.data?.unit_kerja_pptk || "",
          total: r.data?.total || 0,
        });
      })
      .catch(() => { setPejabatList([]); setPejabatMeta({ filtered: false, unit_kerja_pptk: "", total: 0 }); });
  }, [isPptk]);

  useEffect(() => {
    load();
    loadPejabat();
  }, [load, loadPejabat]);

  const filtered = filterStatus ? rows.filter((r) => r.status === filterStatus) : rows;
  const pendingBendahara = rows.filter((r) => r.status === "menunggu_konfirmasi_pejabat").length;
  const dikembalikan = rows.filter((r) => ["dikembalikan_bendahara", "dikembalikan_ppk", "ditolak_pejabat"].includes(r.status)).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-0.5">SPJ · Surat Pertanggungjawaban</p>
            <h3 className="font-bold text-gray-800 text-base">Kelola SPJ Saya</h3>
            {isPptk && <p className="text-xs text-cyan-600 font-medium mt-0.5">✓ PPTK — Bisa membuat SPJ delegasi atas nama pejabat</p>}
          </div>
          <div className="flex gap-2">
            {dikembalikan > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2.5 py-1 font-semibold">
                {dikembalikan} perlu diperbaiki
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-3 gap-3">
        {[
          { label: "Total SPJ", val: rows.length, color: "text-gray-700" },
          { label: "Proses", val: rows.filter((r) => !["draft", "draft_delegasi", "selesai_ppk", "dibayarkan"].includes(r.status)).length, color: "text-amber-600" },
          { label: "Selesai", val: rows.filter((r) => ["selesai_ppk", "dibayarkan", "terverifikasi_ppk"].includes(r.status)).length, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 flex gap-4 border-b border-gray-100">
        {[
          { id: "list", label: "📋 Daftar SPJ Saya" },
          { id: "buat-mandiri", label: "➕ SPJ Mandiri" },
          ...(isPptk ? [{ id: "buat-delegasi", label: "📝 SPJ Delegasi (PPTK)" }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${tab === t.id ? "border-cyan-600 text-cyan-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* LIST */}
        {tab === "list" && (
          <div className="space-y-3">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { val: "", label: "Semua" },
                { val: "draft", label: "Draft" },
                { val: "menunggu_konfirmasi_pejabat", label: "Menunggu Pejabat" },
                { val: "diajukan_ke_bendahara", label: "Di Bendahara" },
                { val: "terverifikasi_ppk", label: "Selesai" },
                { val: "dikembalikan_bendahara", label: "Dikembalikan" },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setFilterStatus(f.val)}
                  className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${filterStatus === f.val ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-gray-600 border-gray-200 hover:border-cyan-300"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-xs text-gray-400 animate-pulse py-4 text-center">Memuat data SPJ…</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">Belum ada SPJ.</p>
                <p className="text-xs text-gray-300 mt-1">Klik tab "SPJ Mandiri" untuk membuat SPJ pertama Anda.</p>
              </div>
            ) : (
              filtered.map((item) => <SpjRow key={item.id} item={item} onRefresh={load} />)
            )}
          </div>
        )}

        {/* FORM MANDIRI */}
        {tab === "buat-mandiri" && (
          <div className="space-y-3">
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 text-xs text-cyan-700">
              <p className="font-semibold">📝 SPJ Kondisi A — Mandiri</p>
              <p className="mt-0.5">Anda membuat SPJ untuk pengeluaran atas nama Anda sendiri.</p>
            </div>
            <SpjForm
              kondisi="mandiri"
              pejabatList={[]}
              onSuccess={() => { load(); setTab("list"); }}
              onCancel={() => setTab("list")}
            />
          </div>
        )}

        {/* FORM DELEGASI */}
        {tab === "buat-delegasi" && isPptk && (
          <div className="space-y-3">
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-xs text-violet-700">
              <p className="font-semibold">📋 SPJ Kondisi B — Delegasi (PPTK)</p>
              <p className="mt-0.5">
                Anda menyiapkan draft SPJ atas nama pejabat berdasarkan bukti pengeluaran yang diserahkan.
                Pejabat <strong>wajib mengkonfirmasi</strong> sebelum SPJ diproses ke Bendahara.
              </p>
            </div>
            <SpjForm
              kondisi="delegasi"
              pejabatList={pejabatList}
              pejabatMeta={pejabatMeta}
              onSuccess={() => { load(); setTab("list"); }}
              onCancel={() => setTab("list")}
            />
          </div>
        )}
      </div>

      {/* Info alur */}
      <div className="px-5 pb-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-600 mb-1">Alur SPJ Bidang/UPTD (sesuai pedoman):</p>
          <p>Semua SPJ dari Bidang dan UPTD diproses melalui <strong>Bendahara Pengeluaran Sekretariat</strong> (tidak ada Bendahara di Bidang/UPTD). Scope sistem: sampai PPK-SKPD menerbitkan nomor SPM.</p>
        </div>
      </div>
    </div>
  );
}
