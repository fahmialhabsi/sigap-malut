import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const TABS = [
  { id: "kasubag", label: "Kasubag" },
  { id: "jf_perencanaan", label: "JF Perencanaan" },
  { id: "jf_keuangan", label: "JF Keuangan/PPK" },
  { id: "bendahara", label: "Bendahara" },
  { id: "bidang_uptd", label: "Bidang + UPTD" },
];

function statusBadge(status) {
  if (status === "menunggu_persetujuan_sekretaris") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  if (status === "dikembalikan_sekretaris") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (status === "disetujui") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  return "bg-gray-50 text-gray-700 border border-gray-200";
}

function SimpleModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full mx-4 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ApprovalQueuePanel() {
  const [activeTab, setActiveTab] = useState("kasubag");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [keputusan, setKeputusan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTab = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get("/api/sekretaris/approval", {
        params: { tab, limit: 50 },
      });
      const rows = res.data?.data || res.data || [];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Gagal memuat approval queue:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]);

  const openModal = (approval) => {
    setSelected(approval);
    setKeputusan("");
    setCatatan("");
    setModalOpen(true);
  };

  const handlePutuskan = async () => {
    if (!selected || !keputusan) return;
    setSubmitting(true);
    try {
      await api.post(`/api/sekretaris/approval/${selected.id}/putuskan`, {
        keputusan,
        catatan,
      });
      setModalOpen(false);
      setSelected(null);
      await fetchTab(activeTab);
    } catch (err) {
      console.error("Putuskan approval error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeruskanKadin = async (approval, e) => {
    e.stopPropagation();
    try {
      await api.post(
        `/api/sekretaris/approval/${approval.id}/teruskan-kadin`,
      );
      await fetchTab(activeTab);
    } catch (err) {
      console.error("Teruskan ke KaDin error:", err);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          ✅ Approval Queue (Sekretaris)
        </h2>
        <span className="text-xs text-gray-500">
          {loading ? "Memuat…" : `${items.length} dokumen`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {loading && (
          <div className="text-gray-400 text-center py-8 text-sm animate-pulse">
            Memuat dokumen antrian persetujuan…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-gray-400 text-center py-8 text-sm">
            Tidak ada dokumen yang menunggu persetujuan.
          </div>
        )}

        {!loading &&
          items.map((approval) => {
            const submittedBy =
              approval.submittedBy?.nama_lengkap ||
              approval.submittedBy?.name ||
              approval.submittedBy?.username ||
              "—";
            const createdAt = approval.created_at || approval.createdAt;
            const tanggalLabel = createdAt
              ? new Date(createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";

            return (
              <div
                key={approval.id}
                onClick={() => openModal(approval)}
                className="p-3.5 rounded-xl bg-white border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {approval.judul || "Tanpa judul"}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {approval.nomor_dokumen || "—"} · {submittedBy}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
                      approval.status,
                    )}`}
                  >
                    {approval.status || "draft"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                  <div className="flex items-center gap-2">
                    <span>Revisi ke-{approval.revisi_ke ?? 0}</span>
                    {approval.asal_unit && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[10px] uppercase tracking-wide text-gray-600">
                        {approval.asal_unit}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{tanggalLabel}</span>
                    <button
                      type="button"
                      onClick={(e) => handleTeruskanKadin(approval, e)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      Teruskan KaDin
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL PUTUSKAN */}
      {selected && (
        <SimpleModal
          isOpen={modalOpen}
          onClose={() => {
            if (submitting) return;
            setModalOpen(false);
          }}
          title="Putuskan Dokumen"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-800">
              <div className="font-semibold">
                {selected.judul || "Tanpa judul"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selected.nomor_dokumen || "—"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-600">
                Keputusan Sekretaris
              </label>
              <select
                value={keputusan}
                onChange={(e) => setKeputusan(e.target.value)}
                className="w-full p-2 rounded-lg bg-white text-gray-800 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Pilih keputusan</option>
                <option value="disetujui">Setujui</option>
                <option value="ditolak">Tolak</option>
                <option value="dikembalikan_sekretaris">Kembalikan untuk revisi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-600">
                Catatan (wajib untuk Tolak/Kembalikan)
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                className="w-full p-2 rounded-lg bg-white text-gray-800 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Tuliskan alasan dan arahan perbaikan…"
              />
            </div>

            <button
              type="button"
              disabled={submitting || !keputusan}
              onClick={handlePutuskan}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-sm font-semibold text-white transition"
            >
              {submitting ? "Memproses…" : "Simpan Keputusan"}
            </button>
          </div>
        </SimpleModal>
      )}
    </section>
  );
}
