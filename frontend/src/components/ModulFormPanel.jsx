/**
 * ModulFormPanel.jsx — Panel form universal untuk semua 94 modul SIGAP-MALUT
 *
 * Semua pekerjaan dilakukan DI DALAM sistem.
 * Field definisi dibaca dari master-data FIELDS CSV secara otomatis.
 *
 * Penggunaan:
 *   <ModulFormPanel modulId="M001" title="Data ASN" />
 *   <ModulFormPanel modulId="M022" title="SPJ" taskId={123} />
 *   <ModulFormPanel modulId="SEK-KEP" title="Layanan Kepegawaian" />
 */
import React, { useCallback, useEffect, useState } from "react";
import DynamicForm from "./DynamicForm";
import { useModulFields, MODUL_API_MAP } from "../hooks/useModulFields";
import api from "../services/api";

// ─── Riwayat data yang sudah diinput ─────────────────────────────────────────
function RiwayatPanel({ endpoint, label }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get(endpoint, { params: { limit: 10 } })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-xs text-gray-400 animate-pulse">Memuat riwayat…</p>;
  if (rows.length === 0) return <p className="text-xs text-gray-400 italic">Belum ada data {label}.</p>;

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {rows.map((row, i) => {
        const key = row.id || row.nip || i;
        const title = row.nama_lengkap || row.title || row.judul || row.nomor_sk
          || row.nip || `Data #${row.id || i + 1}`;
        const sub = row.status || row.tanggal || row.created_at
          ? String(row.status || row.tanggal || (row.created_at || "")).slice(0, 10)
          : "";
        return (
          <div key={key} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{title}</p>
              {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function ModulFormPanel({
  modulId,
  title,
  taskId,           // Jika ada, dikaitkan dengan task tertentu
  initialValues = {},
  onDataSaved,      // callback setelah data berhasil disimpan
  showHistory = true,
  layout = "two-column",
  excludeFields = [],
  readonlyFields = [],
  customEndpoint,   // Override endpoint jika perlu
}) {
  const { fields, loading: fieldsLoading, error: fieldsError } = useModulFields(modulId);
  const [tab, setTab] = useState("form"); // "form" | "riwayat"
  const [savedCount, setSavedCount] = useState(0);

  const moduleMeta = MODUL_API_MAP[modulId] || {};
  const endpoint = customEndpoint || moduleMeta.endpoint;
  const label = title || moduleMeta.label || modulId;

  async function handleSubmit(formData) {
    if (!endpoint) throw new Error("Endpoint API tidak dikonfigurasi untuk modul ini.");

    const payload = { ...formData };
    if (taskId) payload.task_id = taskId;

    const res = await api.post(endpoint, payload);
    if (!res.data?.success && res.data?.error) {
      throw new Error(res.data.error);
    }

    setSavedCount((c) => c + 1);
    onDataSaved?.(res.data?.data);
  }

  if (fieldsLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-400 animate-pulse">Memuat definisi modul {label}…</p>
      </div>
    );
  }

  if (fieldsError) {
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-red-700">Gagal memuat field modul: {modulId}</p>
        <p className="text-xs text-red-500 mt-1">{fieldsError}</p>
        <p className="text-xs text-gray-500 mt-2">
          Pastikan file <span className="font-mono">FIELDS_{modulId}.csv</span> tersedia di folder master-data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-widest mb-0.5">
            Modul {modulId} · {moduleMeta.unit || "SIGAP-MALUT"}
          </p>
          <h3 className="font-bold text-gray-800 text-base">{label}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Data diinput langsung dalam sistem — tidak perlu dokumen eksternal.
          </p>
        </div>
        {savedCount > 0 && (
          <span className="shrink-0 text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
            ✓ {savedCount} tersimpan
          </span>
        )}
      </div>

      {/* Tabs */}
      {showHistory && endpoint && (
        <div className="px-5 pt-3 flex gap-4 border-b border-gray-100">
          {[
            { id: "form", label: "📝 Input Data" },
            { id: "riwayat", label: "📋 Riwayat" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs font-semibold pb-2 border-b-2 transition ${
                tab === t.id
                  ? "border-cyan-600 text-cyan-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        {tab === "form" ? (
          fields.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">Tidak ada field yang dapat ditampilkan untuk modul ini.</p>
            </div>
          ) : (
            <DynamicForm
              fields={fields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitLabel={`Simpan ${label} ke Sistem`}
              layout={layout}
              excludeFields={excludeFields}
              readonlyFields={readonlyFields}
            />
          )
        ) : (
          endpoint ? (
            <RiwayatPanel endpoint={endpoint} label={label} />
          ) : (
            <p className="text-xs text-gray-400 italic">Riwayat tidak tersedia.</p>
          )
        )}
      </div>
    </div>
  );
}
