import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { normalizeRoleKey } from "../../utils/normalizeRole";
import sekretariatModules from "../../data/sekretariatModules";
import HeroKpiTilesSekretaris from "../../components/sekretaris/HeroKpiTilesSekretaris";
import ApprovalQueuePanel from "../../components/sekretaris/ApprovalQueuePanel";
import PengajuanKadinGatewayPanel from "../../components/sekretaris/PengajuanKadinGatewayPanel";
import ReviewTugasVerifiedPanel from "../../components/sekretaris/ReviewTugasVerifiedPanel";
import InboxKadinPanel from "../../components/sekretaris/InboxKadinPanel";
import MonitorPerintahTimeline from "../../components/sekretaris/MonitorPerintahTimeline";
import ScorecardBawahanPanel from "../../components/sekretaris/ScorecardBawahanPanel";
import BypassAlertCenter from "../../components/sekretaris/BypassAlertCenter";
import KonsolidasiLaporanPanel from "../../components/sekretaris/KonsolidasiLaporanPanel";
import SekretarisCoordinationWorkspace from "../../components/coordination/SekretarisCoordinationWorkspace";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import api from "../../services/api";
import ExecutionThreadObservabilityPanel from "../../components/execution/ExecutionThreadObservabilityPanel.jsx";
import HorizontalCoordinationRoleDashboard from "../../components/coordination/HorizontalCoordinationRoleDashboard.jsx";
import { useSekretarisDashboard } from "../../hooks/useSekretarisDashboard";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import TaskDiscussionPanel from "../../components/tasks/TaskDiscussionPanel";
import ModulFormPanel from "../../components/ModulFormPanel";
import SpjKonfirmasiWidget from "../../components/spj/SpjKonfirmasiWidget";
import SpjPpkSkpdPanel from "../../components/spj/SpjPpkSkpdPanel";
import {
  isDemoDataAllowed,
  showSimulationBadge,
} from "../../config/appMode.js";
import NextActionStrip from "../../components/dashboard/NextActionStrip.jsx";

// Fallback hanya jika mode demo (VITE_DEMO_DATA / dev) — produksi: tidak menampilkan KPI statis palsu
const EMPTY_KPI = {
  complianceAlurKoordinasi: null,
  zeroBypassViolations30d: null,
  totalTransaksi30d: null,
  avgApprovalTimeHours: null,
  konsistensiDataKomoditas: null,
  inflasiPangan: null,
};

// Fallback bila API belum tersedia
const FALLBACK_KPI = {
  complianceAlurKoordinasi: null,
  zeroBypassViolations30d: null,
  totalTransaksi30d: null,
  avgApprovalTimeHours: null,
  konsistensiDataKomoditas: null,
  inflasiPangan: null,
};

const FALLBACK_ALERTS = [
  {
    type: "warning",
    message: "3 data keuangan belum valid",
    time: "2 jam lalu",
  },
  {
    type: "danger",
    message: "Bypass alur ditemukan di Bidang Konsumsi",
    time: "1 hari lalu",
  },
  { type: "info", message: "1 dokumen menunggu approval", time: "Baru saja" },
];

const tableData = [
  {
    bidang: "Kepegawaian",
    status: "Valid",
    lastUpdate: "2026-02-22",
    penanggungJawab: "Kasubag Umum",
  },
  {
    bidang: "Keuangan",
    status: "Perlu Validasi",
    lastUpdate: "2026-02-21",
    penanggungJawab: "Bendahara",
  },
  {
    bidang: "Aset",
    status: "Valid",
    lastUpdate: "2026-02-20",
    penanggungJawab: "Kasubag Aset",
  },
  {
    bidang: "Distribusi",
    status: "Revisi",
    lastUpdate: "2026-02-19",
    penanggungJawab: "Kabid Distribusi",
  },
];

function PanelBox({ title, accent = "emerald", children, className = "" }) {
  const accentMap = {
    emerald: "text-emerald-700",
    blue: "text-sky-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };
  const titleColor = accentMap[accent] || accentMap.emerald;

  return (
    <section
      className={`rounded-xl p-5 flex flex-col border border-gray-200 shadow-sm bg-white flex-1 ${className}`}
    >
      <h2
        className={`font-bold mb-3 text-base md:text-lg flex items-center gap-2 ${titleColor}`}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function ComplianceAlertPanel({ alertData }) {
  return (
    <PanelBox title="Kepatuhan & peringatan" accent="amber">
      <ul className="space-y-2">
        {alertData.map((alert, idx) => (
          <li
            key={idx}
            className={`p-2 rounded ${
              alert.type === "danger"
                ? "bg-red-50 text-red-800 border border-red-100"
                : alert.type === "warning"
                  ? "bg-amber-50 text-amber-800 border border-amber-100"
                  : "bg-blue-50 text-blue-800 border border-blue-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <span className="text-xs text-slate-200/75">{alert.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </PanelBox>
  );
}

function DataFlowChart() {
  return (
    <PanelBox title="Alur Data & Koordinasi" accent="blue">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center gap-4">
          {[
            {
              label: "Pelaksana",
              color: "bg-slate-700 text-slate-100",
              desc: "Input Data",
            },
            {
              label: "Fungsional",
              color: "bg-slate-700 text-slate-100",
              desc: "Validasi Teknis",
            },
            {
              label: "Bidang/UPTD",
              color: "bg-slate-700 text-slate-100",
              desc: "Review",
            },
            {
              label: "Sekretariat",
              color: "bg-slate-700 text-white",
              desc: "Integrasi & Distribusi",
            },
            {
              label: "Kepala Dinas",
              color: "bg-slate-700 text-white",
              desc: "Keputusan",
            },
          ].map((node, idx, arr) => (
            <React.Fragment key={node.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full px-4 py-2 font-semibold ${node.color}`}
                >
                  {node.label}
                </div>
                <span className="text-xs mt-1">{node.desc}</span>
              </div>
              {idx < arr.length - 1 && <span className="mx-2 text-xl">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </PanelBox>
  );
}

function LintasBidangTable({ tableData }) {
  return (
    <PanelBox title="Data Lintas Bidang" accent="emerald">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="px-4 py-2 text-left">Bidang</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Update Terakhir</th>
              <th className="px-4 py-2 text-left">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2">{row.bidang}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    row.status === "Valid"
                      ? "text-emerald-600"
                      : row.status === "Revisi"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {row.status}
                </td>
                <td className="px-4 py-2">{row.lastUpdate}</td>
                <td className="px-4 py-2">{row.penanggungJawab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelBox>
  );
}

function QuickActionBar() {
  return (
    <div className="flex flex-wrap gap-3 justify-end">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 border border-blue-600/80 text-xs md:text-sm">
        Upload Dokumen
      </button>
      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm">
        Generate Laporan
      </button>
      <button className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-amber-600 border border-amber-500/80 text-xs md:text-sm">
        Broadcast
      </button>
      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-800/80 text-xs md:text-sm">
        Export Data
      </button>
    </div>
  );
}

function AIFeedbackPanel() {
  return (
    <PanelBox title="AI & Feedback" accent="blue">
      <div className="mb-2 text-sm text-slate-700">
        Rekomendasi AI: Tidak ada bottleneck terdeteksi. Semua alur berjalan
        normal.
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1 text-slate-300/90">
          Laporan Masalah/Feedback:
        </label>
        <textarea
          className="w-full border border-slate-300 bg-white rounded p-2 text-sm text-slate-800"
          rows={2}
          placeholder="Tulis feedback atau masalah di sini..."
        />
        <button className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">
          Kirim
        </button>
      </div>
    </PanelBox>
  );
}

function OpenDataPortal() {
  return (
    <PanelBox title="Open Data Portal" accent="amber">
      <div className="mb-2 text-sm text-slate-700">
        Ringkasan data publik tersedia untuk diunduh:
      </div>
      <div className="flex gap-2">
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download Excel
        </button>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download PDF
        </button>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download CSV
        </button>
      </div>
    </PanelBox>
  );
}

function SpipReportPanel() {
  const [granularity, setGranularity] = useState("year");
  const [source, setSource] = useState("db");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const url = new URL("/spip/report/export", window.location.origin);
      url.searchParams.set("source", source);
      url.searchParams.set("format", "xlsx");
      url.searchParams.set("granularity", granularity);
      if (granularity === "day") url.searchParams.set("date", date);
      if (granularity === "month") {
        url.searchParams.set("year", year);
        url.searchParams.set("month", month);
      }
      if (granularity === "year") url.searchParams.set("year", year);

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Gagal mengunduh laporan SPIP");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `laporan-spip-${granularity}-${stamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PanelBox title="Laporan SPIP (Auto)" accent="emerald">
      <div className="text-sm text-slate-700">
        Generate laporan lengkap SPIP/Manajemen Risiko dan unduh otomatis.
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1 text-slate-500">Periode</label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
          >
            <option value="day">Per tanggal</option>
            <option value="month">Per bulan</option>
            <option value="year">Per tahun</option>
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1 text-slate-500">Sumber Data</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
          >
            <option value="db">DB (transaksi)</option>
            <option value="master">Master-data (CSV)</option>
          </select>
        </div>

        {granularity === "day" ? (
          <div>
            <label className="block text-xs mb-1 text-slate-500">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs mb-1 text-slate-500">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
            />
          </div>
        )}

        {granularity === "month" ? (
          <div>
            <label className="block text-xs mb-1 text-slate-500">Bulan</label>
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
            />
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        <div className="flex items-end">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm disabled:opacity-60"
          >
            {downloading ? "Mengunduh…" : "Download Excel SPIP"}
          </button>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-500">
        Catatan: pilih sumber data DB untuk periodisasi per tanggal/bulan yang akurat.
      </div>
    </PanelBox>
  );
}

function SpipFieldInput({ label, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-slate-500">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
      />
    </div>
  );
}

function SpipFieldTextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-slate-500">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
      />
    </div>
  );
}

function SpipDbPanel() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const defaultYear = String(now.getFullYear());
  const [activeTab, setActiveTab] = useState("risk");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [risks, setRisks] = useState([]);
  const [selectedRiskId, setSelectedRiskId] = useState("");
  const selectedRisk = risks.find((r) => String(r.id) === String(selectedRiskId)) || null;

  const [rtps, setRtps] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [links, setLinks] = useState([]);

  const [riskForm, setRiskForm] = useState({
    unit_kerja: user?.unit_kerja || "Sekretariat",
    periode_tahun: defaultYear,
    kode_risiko: "",
    nama_risiko: "",
    kategori_risiko: "",
    sasaran_konteks: "",
    proses_bisnis_konteks: "",
    pemilik_risiko: "",
    status: "active",
  });
  const [rtpForm, setRtpForm] = useState({
    uraian_rtp: "",
    penanggung_jawab: "",
    target_tanggal: new Date().toISOString().slice(0, 10),
    status: "planned",
  });
  const [monForm, setMonForm] = useState({
    jenis: "kegiatan_pengendalian",
    tanggal: new Date().toISOString().slice(0, 10),
    uraian: "",
    hasil: "",
    nilai: "",
  });
  const [linkForm, setLinkForm] = useState({
    spip_ref_type: "risk",
    spip_ref_id: "",
    sumber_modul: "manual",
    sumber_tabel: "",
    sumber_id: "",
    judul: "",
    url: "",
    occurred_at: "",
    created_by: "",
  });

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/spip/risk", {
        params: {
          limit: 200,
          unit_kerja: riskForm.unit_kerja || undefined,
          periode_tahun: riskForm.periode_tahun || undefined,
        },
      });
      const data = res.data?.data || [];
      setRisks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Gagal memuat Risk Register");
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, [riskForm.unit_kerja, riskForm.periode_tahun]);

  const fetchChildren = useCallback(async (riskId) => {
    if (!riskId) {
      setRtps([]);
      setMonitoring([]);
      setLinks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get("/spip/rtp", { params: { risk_id: riskId, limit: 200 } }),
        api.get("/spip/monitoring", { params: { risk_id: riskId, limit: 200 } }),
        api.get("/spip/evidence/link", {
          params: { spip_ref_type: "risk", spip_ref_id: riskId, limit: 200 },
        }),
      ]);
      setRtps(Array.isArray(r1.data?.data) ? r1.data.data : []);
      setMonitoring(Array.isArray(r2.data?.data) ? r2.data.data : []);
      setLinks(Array.isArray(r3.data?.data) ? r3.data.data : []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data turunan (RTP/Pemantauan/Bukti)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRiskId) fetchChildren(selectedRiskId);
  }, [selectedRiskId, fetchChildren]);

  const submitRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...riskForm,
        periode_tahun: riskForm.periode_tahun ? parseInt(String(riskForm.periode_tahun), 10) : null,
      };
      const res = await api.post("/spip/risk", payload);
      const created = res.data?.data;
      await fetchRisks();
      if (created?.id) setSelectedRiskId(String(created.id));
      setActiveTab("rtp");
      setRiskForm((s) => ({ ...s, kode_risiko: "", nama_risiko: "" }));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Gagal menyimpan risiko");
    } finally {
      setLoading(false);
    }
  };

  const submitRtp = async () => {
    if (!selectedRiskId) {
      setError("Pilih risiko terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/spip/rtp", { risk_id: parseInt(String(selectedRiskId), 10), ...rtpForm });
      setRtpForm((s) => ({ ...s, uraian_rtp: "" }));
      await fetchChildren(selectedRiskId);
      setActiveTab("monitoring");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Gagal menyimpan RTP");
    } finally {
      setLoading(false);
    }
  };

  const submitMonitoring = async () => {
    if (!selectedRiskId) {
      setError("Pilih risiko terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        risk_id: parseInt(String(selectedRiskId), 10),
        ...monForm,
        nilai: monForm.nilai === "" ? null : Number(monForm.nilai),
      };
      await api.post("/spip/monitoring", payload);
      setMonForm((s) => ({ ...s, uraian: "", hasil: "", nilai: "" }));
      await fetchChildren(selectedRiskId);
      setActiveTab("evidence");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Gagal menyimpan pemantauan");
    } finally {
      setLoading(false);
    }
  };

  const submitEvidenceLink = async () => {
    const refId = linkForm.spip_ref_id || selectedRiskId;
    if (!refId) {
      setError("Isi spip_ref_id atau pilih risiko terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...linkForm,
        spip_ref_id: parseInt(String(refId), 10),
        occurred_at: linkForm.occurred_at ? new Date(linkForm.occurred_at).toISOString() : null,
      };
      await api.post("/spip/evidence/link", payload);
      setLinkForm((s) => ({ ...s, judul: "", url: "", sumber_id: "" }));
      await fetchChildren(selectedRiskId);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Gagal menyimpan evidence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelBox title="SPIP (DB) — Input dari awal" accent="emerald">
      <div className="text-sm text-slate-700">
        Isi Risk Register → RTP → Pemantauan → Bukti. Data tersimpan di database dan otomatis muncul di laporan
        `source=db`.
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-600">Pilih Risiko</div>
            <button
              onClick={fetchRisks}
              className="text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          <select
            value={selectedRiskId}
            onChange={(e) => setSelectedRiskId(e.target.value)}
            className="mt-2 w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
          >
            <option value="">— pilih —</option>
            {risks.map((r) => (
              <option key={r.id} value={String(r.id)}>
                [{r.kode_risiko || r.id}] {String(r.nama_risiko).slice(0, 60)}
              </option>
            ))}
          </select>
          {selectedRisk ? (
            <div className="mt-2 text-xs text-slate-600">
              <div className="font-semibold text-slate-700">{selectedRisk.nama_risiko}</div>
              <div>Unit: {selectedRisk.unit_kerja} • Tahun: {selectedRisk.periode_tahun || "-"}</div>
            </div>
          ) : null}
          {error ? (
            <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {error}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {[
              ["risk", "1) Risk Register"],
              ["rtp", "2) RTP"],
              ["monitoring", "3) Pemantauan"],
              ["evidence", "4) Bukti"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  activeTab === id
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "risk" ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <SpipFieldInput
                label="Unit Kerja"
                value={riskForm.unit_kerja}
                onChange={(v) => setRiskForm((s) => ({ ...s, unit_kerja: v }))}
              />
              <SpipFieldInput
                label="Periode Tahun"
                type="number"
                value={riskForm.periode_tahun}
                onChange={(v) => setRiskForm((s) => ({ ...s, periode_tahun: v }))}
              />
              <SpipFieldInput
                label="Kode Risiko"
                value={riskForm.kode_risiko}
                onChange={(v) => setRiskForm((s) => ({ ...s, kode_risiko: v }))}
                placeholder="mis: RISK-2026-001"
              />
              <SpipFieldInput
                label="Kategori Risiko"
                value={riskForm.kategori_risiko}
                onChange={(v) => setRiskForm((s) => ({ ...s, kategori_risiko: v }))}
              />
              <div className="md:col-span-2">
                <SpipFieldTextArea
                  label="Nama Risiko"
                  value={riskForm.nama_risiko}
                  onChange={(v) => setRiskForm((s) => ({ ...s, nama_risiko: v }))}
                  rows={2}
                />
              </div>
              <SpipFieldTextArea
                label="Sasaran/Konteks"
                value={riskForm.sasaran_konteks}
                onChange={(v) => setRiskForm((s) => ({ ...s, sasaran_konteks: v }))}
              />
              <SpipFieldTextArea
                label="Proses Bisnis/Konteks"
                value={riskForm.proses_bisnis_konteks}
                onChange={(v) => setRiskForm((s) => ({ ...s, proses_bisnis_konteks: v }))}
              />
              <SpipFieldInput
                label="Pemilik Risiko"
                value={riskForm.pemilik_risiko}
                onChange={(v) => setRiskForm((s) => ({ ...s, pemilik_risiko: v }))}
              />
              <div>
                <label className="block text-xs mb-1 text-slate-500">Status</label>
                <select
                  value={riskForm.status}
                  onChange={(e) => setRiskForm((s) => ({ ...s, status: e.target.value }))}
                  className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
                >
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={submitRisk}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Simpan Risiko"}
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === "rtp" ? (
            <div className="mt-3 space-y-3">
              <div className="text-xs text-slate-600">
                Risk terpilih: <span className="font-semibold">{selectedRisk ? selectedRisk.nama_risiko : "(belum dipilih)"}</span>
              </div>
              <SpipFieldTextArea
                label="Uraian RTP"
                value={rtpForm.uraian_rtp}
                onChange={(v) => setRtpForm((s) => ({ ...s, uraian_rtp: v }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SpipFieldInput
                  label="Penanggung Jawab"
                  value={rtpForm.penanggung_jawab}
                  onChange={(v) => setRtpForm((s) => ({ ...s, penanggung_jawab: v }))}
                />
                <SpipFieldInput
                  label="Target Tanggal"
                  type="date"
                  value={rtpForm.target_tanggal}
                  onChange={(v) => setRtpForm((s) => ({ ...s, target_tanggal: v }))}
                />
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Status RTP</label>
                  <select
                    value={rtpForm.status}
                    onChange={(e) => setRtpForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="planned">planned</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                    <option value="blocked">blocked</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={submitRtp}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Tambah RTP"}
                </button>
              </div>

              <div className="mt-4 border-t pt-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Daftar RTP</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-slate-600">
                        <th className="text-left p-2 border-b">Uraian</th>
                        <th className="text-left p-2 border-b">PJ</th>
                        <th className="text-left p-2 border-b">Target</th>
                        <th className="text-left p-2 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rtps || []).map((r) => (
                        <tr key={r.id} className="text-slate-800">
                          <td className="p-2 border-b">{r.uraian_rtp}</td>
                          <td className="p-2 border-b">{r.penanggung_jawab || "-"}</td>
                          <td className="p-2 border-b">{r.target_tanggal || "-"}</td>
                          <td className="p-2 border-b">{r.status}</td>
                        </tr>
                      ))}
                      {(!rtps || rtps.length === 0) ? (
                        <tr>
                          <td className="p-2 text-slate-500" colSpan={4}>
                            (belum ada RTP)
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "monitoring" ? (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Jenis Pemantauan</label>
                  <select
                    value={monForm.jenis}
                    onChange={(e) => setMonForm((s) => ({ ...s, jenis: e.target.value }))}
                    className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="kegiatan_pengendalian">kegiatan_pengendalian</option>
                    <option value="peristiwa_risiko">peristiwa_risiko</option>
                    <option value="level_risiko">level_risiko</option>
                    <option value="efektivitas_pengendalian">efektivitas_pengendalian</option>
                  </select>
                </div>
                <SpipFieldInput
                  label="Tanggal"
                  type="date"
                  value={monForm.tanggal}
                  onChange={(v) => setMonForm((s) => ({ ...s, tanggal: v }))}
                />
                <SpipFieldInput
                  label="Nilai (opsional)"
                  type="number"
                  value={monForm.nilai}
                  onChange={(v) => setMonForm((s) => ({ ...s, nilai: v }))}
                />
              </div>
              <SpipFieldTextArea
                label="Uraian"
                value={monForm.uraian}
                onChange={(v) => setMonForm((s) => ({ ...s, uraian: v }))}
              />
              <SpipFieldTextArea
                label="Hasil"
                value={monForm.hasil}
                onChange={(v) => setMonForm((s) => ({ ...s, hasil: v }))}
              />
              <div className="flex justify-end">
                <button
                  onClick={submitMonitoring}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Tambah Pemantauan"}
                </button>
              </div>

              <div className="mt-4 border-t pt-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Daftar Pemantauan</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-slate-600">
                        <th className="text-left p-2 border-b">Jenis</th>
                        <th className="text-left p-2 border-b">Tanggal</th>
                        <th className="text-left p-2 border-b">Uraian</th>
                        <th className="text-left p-2 border-b">Hasil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(monitoring || []).map((r) => (
                        <tr key={r.id} className="text-slate-800">
                          <td className="p-2 border-b">{r.jenis}</td>
                          <td className="p-2 border-b">{r.tanggal}</td>
                          <td className="p-2 border-b">{r.uraian || "-"}</td>
                          <td className="p-2 border-b">{r.hasil || "-"}</td>
                        </tr>
                      ))}
                      {(!monitoring || monitoring.length === 0) ? (
                        <tr>
                          <td className="p-2 text-slate-500" colSpan={4}>
                            (belum ada pemantauan)
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "evidence" ? (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Ref Type</label>
                  <select
                    value={linkForm.spip_ref_type}
                    onChange={(e) => setLinkForm((s) => ({ ...s, spip_ref_type: e.target.value }))}
                    className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="risk">risk</option>
                    <option value="rtp">rtp</option>
                    <option value="monitoring">monitoring</option>
                  </select>
                </div>
                <SpipFieldInput
                  label="Ref ID (kosong = pakai risk terpilih)"
                  type="number"
                  value={linkForm.spip_ref_id}
                  onChange={(v) => setLinkForm((s) => ({ ...s, spip_ref_id: v }))}
                  placeholder={selectedRiskId ? `contoh: ${selectedRiskId}` : "id"}
                />
                <SpipFieldInput
                  label="Sumber Modul"
                  value={linkForm.sumber_modul}
                  onChange={(v) => setLinkForm((s) => ({ ...s, sumber_modul: v }))}
                  placeholder="audit_log / approval_log / spj / sek_ast / manual"
                />
                <SpipFieldInput
                  label="Sumber ID"
                  value={linkForm.sumber_id}
                  onChange={(v) => setLinkForm((s) => ({ ...s, sumber_id: v }))}
                  placeholder="id dari sumber (opsional)"
                />
                <SpipFieldInput
                  label="URL Bukti (opsional)"
                  value={linkForm.url}
                  onChange={(v) => setLinkForm((s) => ({ ...s, url: v }))}
                  placeholder="https://..."
                />
                <SpipFieldInput
                  label="Occurred At (opsional)"
                  type="datetime-local"
                  value={linkForm.occurred_at}
                  onChange={(v) => setLinkForm((s) => ({ ...s, occurred_at: v }))}
                />
                <div className="md:col-span-2">
                  <SpipFieldTextArea
                    label="Judul Bukti"
                    value={linkForm.judul}
                    onChange={(v) => setLinkForm((s) => ({ ...s, judul: v }))}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={submitEvidenceLink}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Tambah Bukti"}
                </button>
              </div>

              <div className="mt-4 border-t pt-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Daftar Bukti (Evidence Link)</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-slate-600">
                        <th className="text-left p-2 border-b">Occurred</th>
                        <th className="text-left p-2 border-b">Sumber</th>
                        <th className="text-left p-2 border-b">Judul</th>
                        <th className="text-left p-2 border-b">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(links || []).map((r) => (
                        <tr key={r.id} className="text-slate-800">
                          <td className="p-2 border-b">{r.occurred_at ? String(r.occurred_at).slice(0, 19) : "-"}</td>
                          <td className="p-2 border-b">{r.sumber_modul}</td>
                          <td className="p-2 border-b">{r.judul || "-"}</td>
                          <td className="p-2 border-b">
                            {r.url ? (
                              <a className="text-emerald-700 underline" href={r.url} target="_blank" rel="noreferrer">
                                link
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!links || links.length === 0) ? (
                        <tr>
                          <td className="p-2 text-slate-500" colSpan={4}>
                            (belum ada bukti)
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PanelBox>
  );
}

export default function DashboardSekretariat() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleKey(user);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { inboxCount, approvalCount, bypassCount } = useSekretarisDashboard();
  const [kpi, setKpi] = useState(() =>
    isDemoDataAllowed() ? FALLBACK_KPI : EMPTY_KPI,
  );
  const [alertData, setAlertData] = useState(() =>
    isDemoDataAllowed() ? FALLBACK_ALERTS : [],
  );
  const [kpiLoading, setKpiLoading] = useState(false);
  const [renstraQueue, setRenstraQueue] = useState([]);
  const [renstraLoading, setRenstraLoading] = useState(true);
  const [notifPesan, setNotifPesan] = useState("");
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState(null);
  const [cascadeData, setCascadeData] = useState(null);
  const [cascadeLoading, setCascadeLoading] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);

  useEffect(() => {
    api.get("/sekretaris/tugas-terverifikasi", { params: { limit: 1 } })
      .then((r) => setVerifiedCount(r.data?.pagination?.total ?? (r.data?.data?.length ?? 0)))
      .catch(() => setVerifiedCount(0));
  }, []);

  const fetchKPIs = useCallback(async () => {
    setKpiLoading(true);
    try {
      const res = await api.get("/dashboard/sekretaris/summary");
      const d = res.data?.data;
      if (d) {
        setKpi(d);
        // Generate alert items from live KPI data
        const liveAlerts = [];
        if (d.zeroBypassViolations30d > 0) {
          liveAlerts.push({
            type: "danger",
            message: `${d.zeroBypassViolations30d} bypass alur terdeteksi dalam 30 hari`,
            time: "Data real-time",
          });
        }
        if (
          d.konsistensiDataKomoditas !== null &&
          d.konsistensiDataKomoditas < 80
        ) {
          liveAlerts.push({
            type: "warning",
            message: `Konsistensi komoditas ${d.konsistensiDataKomoditas}% — di bawah target 80%`,
            time: "Bulan ini",
          });
        }
        if (d.inflasiPangan !== null && d.inflasiPangan > 3) {
          liveAlerts.push({
            type: "danger",
            message: `Inflasi pangan ${d.inflasiPangan}% — melampaui batas 3%`,
            time: "Bulan ini",
          });
        }
        if (liveAlerts.length > 0) setAlertData(liveAlerts);
      }
    } catch {
      if (isDemoDataAllowed()) {
        setKpi(FALLBACK_KPI);
        setAlertData(FALLBACK_ALERTS);
      } else {
        setKpi(EMPTY_KPI);
        setAlertData([]);
      }
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Fetch perencanaan queue dari e-Pelara
  useEffect(() => {
    setRenstraLoading(true);
    api
      .get("/api/epelara/renstra-opd", { params: { limit: 10 } })
      .then((res) => {
        const d = res.data;
        setRenstraQueue(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => setRenstraQueue([]))
      .finally(() => setRenstraLoading(false));
  }, []);

  // Cascading check dari e-Pelara
  useEffect(() => {
    if (!user) return;
    setCascadeLoading(true);
    api
      .get("/api/epelara/cascading")
      .then((res) => setCascadeData(res.data ?? null))
      .catch(() => setCascadeData(null))
      .finally(() => setCascadeLoading(false));
  }, [user]);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "SA01",
        status: "akses",
        detail: "Akses modul Monitoring 50 indikator",
      });
    }
  }, [user]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "sekretaris" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja.includes("sekretariat"));

  if (!isAllowed) return <Navigate to="/" replace />;

  const moduleCards = [...sekretariatModules]
    .filter(
      (row) =>
        row?.is_active === undefined ||
        row?.is_active === null ||
        row?.is_active === true ||
        String(row?.is_active).toLowerCase() === "true" ||
        String(row?.is_active) === "1",
    )
    .sort((a, b) => {
      const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
      const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
      return orderA - orderB;
    });

  const SIDEBAR_MENU = [
    { id: "overview", label: "Beranda ringkas", icon: "📊" },
    { id: "spip_db", label: "Input SPIP (basis data)", icon: "🧾", badge: null },
    {
      id: "inbox",
      label: "Tugas dari Ka.Dinas & bawahan",
      icon: "📥",
      badge: inboxCount || null,
    },
    {
      id: "komunikasi",
      label: "Tanggapan & diskusi",
      icon: "💬",
      badge: null,
    },
    {
      id: "approval",
      label: "Antrean persetujuan",
      icon: "✅",
      badge: approvalCount || null,
    },
    {
      id: "review_tugas",
      label: "Perlu persetujuan Sekretaris",
      icon: "🔐",
      badge: verifiedCount > 0 ? verifiedCount : null,
    },
    {
      id: "gateway_kadin",
      label: "Pengajuan ke Kepala Dinas",
      iconOverride: "[GW]",
      icon: "🛡️",
      badge: null,
    },
    { id: "timeline", label: "Pantau penugasan", icon: "📋", badge: null },
    {
      id: "coordination",
      label: "Perintah & koordinasi",
      icon: "🔗",
      badge: null,
    },
    {
      id: "scorecard",
      label: "Kinerja bawahan",
      icon: "📊",
      badge: null,
    },
    {
      id: "bypass",
      label: "Peringatan pelanggaran alur",
      icon: "🔎",
      badge: bypassCount || null,
    },
    {
      id: "spj-ppk",
      label: "Verifikasi SPJ & SPM (PPK)",
      icon: "🖋️",
    },
    {
      id: "konsolidasi",
      label: "Kumpulan laporan",
      icon: "📑",
      badge: null,
    },
    { divider: true, label: "MODUL SEKRETARIAT" },
    ...moduleCards.slice(0, 12).map((m) => ({
      id: `mod-${m.id}`,
      label: m.name || m.id,
      icon: "🧩",
    })),
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            {showSimulationBadge() ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                Tampilan sedang memakai <strong>data contoh</strong> untuk uji
                antarmuka (bukan data resmi). Untuk lingkungan produksi,
                nonaktifkan mode contoh di pengaturan pembangunan aplikasi.
              </div>
            ) : null}
            <NextActionStrip
              title="Yang perlu dikerjakan dulu"
              items={[
                approvalCount > 0 && {
                  key: "appr",
                  label: `Lihat ${approvalCount} berkas menunggu persetujuan`,
                  onClick: () => setActiveMenu("approval"),
                },
                inboxCount > 0 && {
                  key: "inbox",
                  label: `Buka ${inboxCount} tugas dari Ka.Dinas / bawahan`,
                  onClick: () => setActiveMenu("inbox"),
                },
                bypassCount > 0 && {
                  key: "bypass",
                  label: `Tindaklanjuti ${bypassCount} peringatan pelanggaran alur`,
                  onClick: () => setActiveMenu("bypass"),
                },
              ].filter(Boolean)}
            />
            <HeroKpiTilesSekretaris />
            <HorizontalCoordinationRoleDashboard
              variant="sekretaris"
              title="Pusat koordinasi lintas bidang"
            />
            <ExecutionThreadObservabilityPanel title="Perkembangan penugasan & koordinasi" />
            {/* SPJ atas nama Sekretaris yang menunggu konfirmasi */}
            <SpjKonfirmasiWidget />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ApprovalQueuePanel />
                <PengajuanKadinGatewayPanel />
              </div>
              <div className="space-y-6">
                <ComplianceAlertPanel alertData={alertData} />
                <PanelBox title="Aksi Cepat" accent="emerald">
                  <QuickActionBar />
                </PanelBox>
                <SpipReportPanel />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataFlowChart />
              {isDemoDataAllowed() ? (
                <LintasBidangTable tableData={tableData} />
              ) : (
                <PanelBox title="Ringkasan lintas bidang" accent="slate">
                  <p className="text-sm text-slate-600">
                    Data gabungan antar bidang akan tampil otomatis setelah
                    sistem menghubungkan sumber data resmi. Saat ini tampilan
                    contoh dimatikan agar tidak tertukar dengan data definitif.
                  </p>
                </PanelBox>
              )}
            </div>
            <PanelBox title="Penugasan ke bawahan & koordinasi" accent="blue">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-700">
                  Di sini Anda membuat surat tugas ke Kasubag, bendahara, dan
                  jabatan fungsional Sekretariat, serta surat koordinasi ke
                  Kepala Bidang atau UPTD — agar alurnya jelas dan terpisah dari
                  pesan rutin.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMenu("coordination")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 border border-blue-600/80 text-xs md:text-sm"
                  >
                    Buka formulir penugasan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("timeline")}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-800/80 text-xs md:text-sm"
                  >
                    Lihat status penugasan
                  </button>
                </div>
              </div>
            </PanelBox>
          </div>
        );
      case "spip_db":
        return (
          <div className="space-y-6">
            <SpipDbPanel />
            <SpipReportPanel />
          </div>
        );
      case "inbox":
        return (
          <InboxKadinPanel
            onSesudahTandaiDibaca={() => setActiveMenu("coordination")}
          />
        );
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES3_ES4}
            titleTanggapan="Tanggapan Kasubag, pejabat fungsional, dan bendahara"
            titleDiskusi="Diskusi dengan bawahan terkait tugas"
            diskusiSlot={<TaskDiscussionPanel />}
          />
        );
      case "approval":
        return <ApprovalQueuePanel />;
      case "review_tugas":
        return <ReviewTugasVerifiedPanel />;
      case "coordination":
        return <SekretarisCoordinationWorkspace />;
      case "timeline":
        return <MonitorPerintahTimeline />;
      case "scorecard":
        return <ScorecardBawahanPanel />;
      case "bypass":
        return <BypassAlertCenter />;
      case "konsolidasi":
        return <KonsolidasiLaporanPanel />;
      case "spj-ppk":
        return (
          <div className="space-y-5">
            <SpjKonfirmasiWidget />
            <SpjPpkSkpdPanel />
          </div>
        );
      default: {
        // Handle mod-M001 … mod-M031, mod-SA01 … mod-SA10, dll.
        if (activeMenu.startsWith("mod-")) {
          const modulId = activeMenu.replace("mod-", "");
          return (
            <ModulFormPanel
              modulId={modulId}
              layout="two-column"
              showHistory
            />
          );
        }
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">
              Modul ini sedang dalam pengembangan.
            </p>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-200`}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">Sekretaris</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  activeMenu === item.id
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.iconOverride || item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <BukaEPelaraButton
            label="e-Pelara"
            targetPath="/"
            className="w-full !py-2 !text-xs"
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-emerald-900/95 to-slate-900/80 border-b border-emerald-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">
                Sekretaris — Hub Koordinasi
              </h1>
              <p className="text-emerald-200/70 text-xs">
                {user?.nama_lengkap || user?.name || "—"} ·{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <UploadSuratMasukQuickAction showBendaharaHint />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
