import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : "";
}

/**
 * Panel admin: preview/apply/rollback migrasi FK transaksi (dpa, rka, spj) dari mapping approved.
 */
export default function RegulasiTransactionApplyPanel() {
  const [versi, setVersi] = useState([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [preview, setPreview] = useState(null);
  const [unmapped, setUnmapped] = useState(null); // null = belum dimuat
  const [batches, setBatches] = useState([]);
  const [batchDetail, setBatchDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const loadVersi = useCallback(async () => {
    try {
      const res = await api.get("/migration/regulasi-versi");
      const list = res.data?.data?.versi ?? [];
      setVersi(list);
    } catch {
      setVersi([]);
      toast.error("Gagal memuat daftar versi regulasi");
    }
  }, []);

  const loadBatches = useCallback(async () => {
    try {
      const res = await api.get("/migration/transaction-batches", { params: { limit: 40 } });
      setBatches(res.data?.data?.batches ?? []);
    } catch {
      toast.error("Gagal memuat riwayat batch");
    }
  }, []);

  useEffect(() => {
    loadVersi();
    loadBatches();
  }, [loadVersi, loadBatches]);

  const expectedChangeRows = useMemo(() => {
    if (!preview?.changes) return 0;
    return preview.changes.filter((c) => !c.skip_reason).length;
  }, [preview]);

  const handlePreview = async () => {
    if (!fromId || !toId || fromId === toId) {
      toast.error("Pilih versi asal dan tujuan yang valid");
      return;
    }
    setLoading(true);
    setPreview(null);
    try {
      const res = await api.get("/migration/preview-transaction-updates", {
        params: {
          regulasi_versi_from_id: fromId,
          regulasi_versi_to_id: toId,
        },
        timeout: 120000,
      });
      setPreview(res.data?.data ?? null);
      toast.success("Preview dimuat");
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      toast.error(msg);
      if (e.response?.data?.duplicates) {
        setPreview({ governance_error: true, duplicates: e.response.data.duplicates });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnmapped = async () => {
    if (!fromId || !toId) {
      toast.error("Pilih versi asal dan tujuan");
      return;
    }
    setLoading(true);
    setUnmapped(null);
    try {
      const res = await api.get("/migration/unmapped-transactions", {
        params: {
          regulasi_versi_from_id: fromId,
          regulasi_versi_to_id: toId,
        },
        timeout: 120000,
      });
      setUnmapped(res.data?.data ?? null);
      toast.success("Daftar unmapped dimuat");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!fromId || !toId) {
      toast.error("Pilih versi asal dan tujuan");
      return;
    }
    if (expectedChangeRows > 0) {
      const ok = window.confirm(
        `Terapkan perubahan ke ${expectedChangeRows} baris transaksi? Pastikan Anda sudah meninjau preview.`,
      );
      if (!ok) return;
    }
    setLoading(true);
    try {
      const res = await api.post(
        "/migration/apply-to-transactions",
        {
          regulasi_versi_from_id: Number(fromId),
          regulasi_versi_to_id: Number(toId),
          note: note || null,
          confirm_apply: true,
          expected_change_rows: expectedChangeRows,
        },
        { timeout: 180000 },
      );
      toast.success(res.data?.message || "Apply selesai");
      setPreview(null);
      await loadBatches();
    } catch (e) {
      const d = e.response?.data;
      toast.error(d?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBatchDetail = async () => {
    const id = num(selectedBatchId);
    if (!id) {
      toast.error("Pilih batch");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/migration/transaction-batch-detail", {
        params: { batchId: id },
      });
      setBatchDetail(res.data?.data ?? null);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setBatchDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    const id = num(selectedBatchId);
    if (!id) {
      toast.error("Pilih batch");
      return;
    }
    if (!window.confirm(`Rollback batch #${id}? Referensi transaksi akan dikembalikan ke nilai sebelum apply.`)) {
      return;
    }
    setLoading(true);
    try {
      await api.post("/migration/rollback-transaction-apply", { batch_id: id }, { timeout: 180000 });
      toast.success("Rollback selesai");
      setBatchDetail(null);
      await loadBatches();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const summaryTables = preview?.summary?.tables || {};

  return (
    <div className="space-y-6 text-ink">
      <div className="rounded-xl border border-exec-border bg-card p-4 shadow-soft-sm">
        <h3 className="text-lg font-semibold mb-3">Pasangan versi regulasi</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Versi asal (from)</span>
            <select
              className="border rounded-lg px-3 py-2 min-w-[200px] bg-bg"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              <option value="">— pilih —</option>
              {versi.map((v) => (
                <option key={v.id} value={v.id}>
                  #{v.id} — {v.nama_regulasi} ({v.tahun})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Versi tujuan (to)</span>
            <select
              className="border rounded-lg px-3 py-2 min-w-[200px] bg-bg"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              <option value="">— pilih —</option>
              {versi.map((v) => (
                <option key={`t-${v.id}`} value={v.id}>
                  #{v.id} — {v.nama_regulasi} ({v.tahun})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={handlePreview}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium disabled:opacity-50"
          >
            Preview perubahan
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleUnmapped}
            className="px-4 py-2 rounded-lg border border-amber-600 text-amber-800 text-sm font-medium disabled:opacity-50"
          >
            Unmapped
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          Apply memerlukan <code className="text-[11px]">confirm_apply</code> di backend; panel ini mengirim jumlah
          baris yang diharapkan sesuai preview terakhir.
        </p>
      </div>

      {preview?.governance_error && preview?.duplicates?.length ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm">
          <strong className="text-red-800">Konflik governance:</strong> lebih dari satu mapping approved untuk sub
          lama yang sama. Perbaiki di database / UI mapping sebelum lanjut.
          <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(preview.duplicates, null, 2)}</pre>
        </div>
      ) : null}

      {preview && !preview.governance_error ? (
        <div className="rounded-xl border border-exec-border bg-card p-4 shadow-soft-sm space-y-3">
          <h3 className="text-lg font-semibold">Ringkasan preview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="rounded-lg bg-bg p-2 border border-muted/30">
              <div className="text-muted text-xs">Mapping approved</div>
              <div className="font-semibold tabular-nums">{preview.summary?.approved_mappings ?? "—"}</div>
            </div>
            <div className="rounded-lg bg-bg p-2 border border-muted/30">
              <div className="text-muted text-xs">Baris akan diubah</div>
              <div className="font-semibold tabular-nums text-emerald-700">{expectedChangeRows}</div>
            </div>
            <div className="rounded-lg bg-bg p-2 border border-muted/30">
              <div className="text-muted text-xs">Sudah ter-apply</div>
              <div className="font-semibold tabular-nums">{preview.summary?.skipped_already ?? "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Per tabel</div>
            <ul className="text-sm space-y-1">
              {Object.keys(summaryTables).length === 0 ? (
                <li className="text-muted">Tidak ada baris baru untuk diubah.</li>
              ) : (
                Object.entries(summaryTables).map(([tb, c]) => (
                  <li key={tb}>
                    <span className="font-mono">{tb}</span>: <strong>{c}</strong> baris
                  </li>
                ))
              )}
            </ul>
          </div>
          {preview.warnings?.length ? (
            <div className="text-amber-800 text-sm bg-amber-50 border border-amber-200 rounded-lg p-2">
              {preview.warnings.map((w, i) => (
                <div key={i}>{typeof w === "string" ? w : w.message || JSON.stringify(w)}</div>
              ))}
            </div>
          ) : null}
          <label className="block text-sm">
            <span className="text-muted">Catatan batch (opsional)</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-bg"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: sinkron pasca Permendagri 2026"
            />
          </label>
          <button
            type="button"
            disabled={loading || expectedChangeRows === 0}
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
          >
            Apply ke transaksi ({expectedChangeRows} baris)
          </button>
        </div>
      ) : null}

      {preview?.changes?.length && !preview.governance_error ? (
        <div className="rounded-xl border border-exec-border bg-card p-4 shadow-soft-sm overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">Detail baris</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Tabel</th>
                <th className="py-2 pr-2">Row</th>
                <th className="py-2 pr-2">Sebelum (prog/keg/sub)</th>
                <th className="py-2 pr-2">Sesudah</th>
                <th className="py-2 pr-2">Skip</th>
              </tr>
            </thead>
            <tbody>
              {preview.changes.slice(0, 200).map((c, idx) => (
                <tr key={idx} className="border-b border-muted/20">
                  <td className="py-1.5 pr-2 font-mono">{c.table_name}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{c.row_id}</td>
                  <td className="py-1.5 pr-2 font-mono text-xs">
                    {c.before?.master_program_id}/{c.before?.master_kegiatan_id}/{c.before?.master_sub_kegiatan_id}
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-xs">
                    {c.after?.master_program_id}/{c.after?.master_kegiatan_id}/{c.after?.master_sub_kegiatan_id}
                  </td>
                  <td className="py-1.5 pr-2">{c.skip_reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.changes.length > 200 ? (
            <p className="text-xs text-muted mt-2">Menampilkan 200 pertama dari {preview.changes.length}</p>
          ) : null}
        </div>
      ) : null}

      {unmapped !== null ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-soft-sm">
          <h3 className="text-lg font-semibold mb-2">Transaksi belum / tidak bisa dimigrasi</h3>
          <p className="text-xs text-muted mb-2">
            Ringkasan: {JSON.stringify(unmapped.summary?.counts_by_reason || {})}
          </p>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-amber-100/90">
                <tr className="text-left">
                  <th className="py-2 pr-2">Tabel</th>
                  <th className="py-2 pr-2">Row id</th>
                  <th className="py-2 pr-2">master_sub_kegiatan_id</th>
                  <th className="py-2 pr-2">Kode alasan</th>
                  <th className="py-2 pr-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {(unmapped.unmapped || []).slice(0, 300).map((u, i) => (
                  <tr key={i} className="border-b border-amber-200/50">
                    <td className="py-1 font-mono">{u.table_name}</td>
                    <td className="py-1 tabular-nums">{u.row_id}</td>
                    <td className="py-1 tabular-nums">{u.master_sub_kegiatan_id ?? "NULL"}</td>
                    <td className="py-1 font-mono text-xs">
                      {u.reason_code}
                      {u.reason_group && u.reason_group !== u.reason_code ? (
                        <span className="block text-[10px] text-muted">group: {u.reason_group}</span>
                      ) : null}
                    </td>
                    <td className="py-1 text-xs">{u.reason_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-exec-border bg-card p-4 shadow-soft-sm space-y-3">
        <h3 className="text-lg font-semibold">Riwayat batch & rollback</h3>
        <button
          type="button"
          disabled={loading}
          onClick={loadBatches}
          className="text-sm underline text-slate-700"
        >
          Muat ulang daftar
        </button>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border rounded-lg px-3 py-2 bg-bg min-w-[220px]"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            <option value="">— pilih batch —</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                #{b.id} {b.status} — from {b.regulasi_versi_from_id} → to {b.regulasi_versi_to_id} (
                {b.row_count} baris)
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={loading}
            onClick={handleLoadBatchDetail}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Detail
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleRollback}
            className="px-3 py-2 rounded-lg bg-red-700 text-white text-sm disabled:opacity-50"
          >
            Rollback batch ini
          </button>
        </div>
        {batchDetail ? (
          <div className="text-sm space-y-1">
            <div>
              <strong>Batch</strong> #{batchDetail.batch?.id} — status{" "}
              <span className="font-mono">{batchDetail.batch?.status}</span>
            </div>
            <div className="text-xs text-muted">
              {batchDetail.log_count} entri log — rollback hanya untuk status <code>applied</code> dan belum
              di-rollback.
            </div>
            <div className="max-h-48 overflow-auto border rounded-lg p-2 bg-bg font-mono text-xs">
              {(batchDetail.logs || []).slice(0, 80).map((L) => (
                <div key={L.id}>
                  {L.table_name}#{L.row_pk} rolled_back_at={L.rolled_back_at || "—"}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
