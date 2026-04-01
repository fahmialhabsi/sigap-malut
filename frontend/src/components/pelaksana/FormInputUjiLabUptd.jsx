import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const TABS = [
  { id: "kimia", label: "Kimia" },
  { id: "mikrobiologi", label: "Mikrobiologi" },
  { id: "fisik", label: "Fisik" },
];

export default function FormInputUjiLabUptd() {
  const [tab, setTab] = useState("kimia");
  const [nomorOrder, setNomorOrder] = useState("");
  const [items, setItems] = useState([{ parameter: "", nilai_terukur: "", satuan: "", status_hasil: "perlu_verifikasi" }]);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const fetchRiwayat = () => {
    setLoadingRows(true);
    api
      .get("/api/pelaksana/uptd/teknis/uji-lab/riwayat", { params: { limit: 8 } })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoadingRows(false));
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hint = useMemo(() => {
    if (tab === "kimia") return "Contoh parameter: Residu pestisida, Logam berat…";
    if (tab === "mikrobiologi") return "Contoh: TPC, Coliform, Salmonella, E. coli…";
    return "Contoh: Kadar air, Warna, Tekstur…";
  }, [tab]);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      { parameter: "", nilai_terukur: "", satuan: "", status_hasil: "perlu_verifikasi" },
    ]);

  const updateRow = (idx, patch) =>
    setItems((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const removeRow = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    const filtered = items
      .map((r) => ({
        ...r,
        parameter: String(r.parameter || "").trim(),
        nilai_terukur: r.nilai_terukur === "" ? null : r.nilai_terukur,
      }))
      .filter((r) => r.parameter);

    if (filtered.length === 0) {
      notifyError("Isi minimal 1 parameter.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/pelaksana/uptd/teknis/uji-lab", {
        jenis: tab,
        nomor_order: nomorOrder || undefined,
        items: filtered,
      });
      const no = res.data?.data?.nomor_order;
      notifySuccess(no ? `Terkirim. Nomor order: ${no}` : "Terkirim ke Kasi Teknis (wajib).");
      setNomorOrder(no || "");
      setItems([{ parameter: "", nilai_terukur: "", satuan: "", status_hasil: "perlu_verifikasi" }]);
      fetchRiwayat();
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal mengirim hasil uji.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">🧪 Input Hasil Uji Lab (UPTD Teknis)</h2>
        <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          Submit ke Kasi Teknis (wajib)
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">{hint}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              tab === t.id
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nomor order (opsional)</label>
          <input
            value={nomorOrder}
            onChange={(e) => setNomorOrder(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="Mis. ORD-2026-..."
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Jika kosong, sistem akan membuat order uji sederhana (sementara).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-2 py-2 text-left">Parameter</th>
                <th className="px-2 py-2 text-left">Nilai</th>
                <th className="px-2 py-2 text-left">Satuan</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-2 py-2">
                    <input
                      value={r.parameter}
                      onChange={(e) => updateRow(idx, { parameter: e.target.value })}
                      className="w-56 border rounded-lg px-2 py-1.5 text-sm"
                      placeholder="Nama parameter"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={r.nilai_terukur}
                      onChange={(e) => updateRow(idx, { nilai_terukur: e.target.value })}
                      className="w-28 border rounded-lg px-2 py-1.5 text-sm font-mono"
                      placeholder="0.0"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={r.satuan}
                      onChange={(e) => updateRow(idx, { satuan: e.target.value })}
                      className="w-24 border rounded-lg px-2 py-1.5 text-sm"
                      placeholder="mg/kg"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={r.status_hasil}
                      onChange={(e) => updateRow(idx, { status_hasil: e.target.value })}
                      className="border rounded-lg px-2 py-1.5 text-sm"
                    >
                      <option value="memenuhi">memenuhi</option>
                      <option value="tidak_memenuhi">tidak_memenuhi</option>
                      <option value="perlu_verifikasi">perlu_verifikasi</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="text-xs px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                      disabled={items.length === 1}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            + Tambah Parameter
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold"
          >
            {submitting ? "Mengirim…" : "Kirim ke Kasi Teknis"}
          </button>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-sm">🕒 Riwayat kirim (Order Uji)</h3>
          <button
            type="button"
            onClick={fetchRiwayat}
            className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Refresh
          </button>
        </div>
        {loadingRows ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {r.nomor_order || `Order #${r.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Jenis: {r.jenis_uji || "—"} · Terima: {r.tanggal_terima || "—"}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                    {r.status || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

