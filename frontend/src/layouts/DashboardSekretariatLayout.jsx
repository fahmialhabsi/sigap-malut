import React from "react";

// Data dummy (bisa diganti API)
const kpiData = [
  {
    label: "Compliance Koordinasi",
    value: "98%",
    info: "Koordinasi lintas bidang",
  },
  { label: "Dokumen Masuk", value: 120, info: "Bulan ini" },
  { label: "Alert Data", value: 3, info: "Perlu validasi" },
  { label: "Audit Log", value: 250, info: "Aksi tercatat" },
];

const alertData = [
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

// Komponen modular
function ExecutiveSummaryPanel({ kpiData }) {
  return (
    <div className="col-span-2 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2">Executive Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-blue-50 rounded-lg p-4 flex flex-col items-center"
          >
            <span className="text-2xl font-bold">{kpi.value}</span>
            <span className="text-xs text-blue-700">{kpi.label}</span>
            <span className="text-xs text-muted mt-1">{kpi.info}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceAlertPanel({ alertData }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
      <h3 className="font-bold text-lg mb-2">Compliance & Alert</h3>
      <ul className="space-y-2">
        {alertData.map((alert, idx) => (
          <li
            key={idx}
            className={`p-2 rounded ${alert.type === "danger" ? "bg-red-100 text-red-700" : alert.type === "warning" ? "bg-yellow-100 text-yellow-800" : "bg-blue-50 text-blue-700"}`}
          >
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <span className="text-xs text-muted">{alert.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataFlowChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">Alur Data & Koordinasi</h3>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center gap-4">
          {[
            {
              label: "Pelaksana",
              color: "bg-blue-200 text-blue-800",
              desc: "Input Data",
            },
            {
              label: "Fungsional",
              color: "bg-blue-200 text-blue-800",
              desc: "Validasi Teknis",
            },
            {
              label: "Bidang/UPTD",
              color: "bg-blue-200 text-blue-800",
              desc: "Review",
            },
            {
              label: "Sekretariat",
              color: "bg-blue-500 text-white",
              desc: "Integrasi & Distribusi",
            },
            {
              label: "Kepala Dinas",
              color: "bg-green-500 text-white",
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
    </div>
  );
}

function LintasBidangTable({ tableData }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">Data Lintas Bidang</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50 text-blue-700">
              <th className="px-4 py-2 text-left">Bidang</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Update Terakhir</th>
              <th className="px-4 py-2 text-left">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="px-4 py-2">{row.bidang}</td>
                <td
                  className={`px-4 py-2 font-semibold ${row.status === "Valid" ? "text-green-600" : row.status === "Revisi" ? "text-yellow-700" : "text-red-600"}`}
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
    </div>
  );
}

function QuickActionBar() {
  return (
    <div className="flex flex-wrap gap-4 justify-end">
      <button className="bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-800">
        Upload Dokumen
      </button>
      <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-green-700">
        Generate Laporan
      </button>
      <button className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-600">
        Broadcast
      </button>
      <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow hover:bg-blue-50 border border-blue-200">
        Export Data
      </button>
    </div>
  );
}

function AIFeedbackPanel() {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
      <h3 className="font-bold text-lg mb-2">AI & Feedback</h3>
      <div className="mb-2 text-sm text-muted">
        Rekomendasi AI: Tidak ada bottleneck terdeteksi. Semua alur berjalan
        normal.
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1">Laporan Masalah/Feedback:</label>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Tulis feedback atau masalah di sini..."
        />
        <button className="mt-2 bg-blue-700 text-white px-3 py-1 rounded font-semibold hover:bg-blue-800">
          Kirim
        </button>
      </div>
    </div>
  );
}

function OpenDataPortal() {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
      <h3 className="font-bold text-lg mb-2">Open Data Portal</h3>
      <div className="mb-2 text-sm text-muted">
        Ringkasan data publik tersedia untuk diunduh:
      </div>
      <div className="flex gap-2">
        <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow hover:bg-blue-50 border border-blue-200">
          Download Excel
        </button>
        <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow hover:bg-blue-50 border border-blue-200">
          Download PDF
        </button>
        <button className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow hover:bg-blue-50 border border-blue-200">
          Download CSV
        </button>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA LAYOUT ---
export default function DashboardSekretariatLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-muted bg-ink/80 backdrop-blur text-surface">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <h2 className="text-2xl font-display text-primary font-bold">
            Dashboard Sekretariat
          </h2>
          <p className="text-sm text-muted">
            Ringkasan & Hub Data Administrasi
          </p>
        </div>
      </header>

      {/* Executive Summary & Compliance/Alert Panel */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6">
        <ExecutiveSummaryPanel kpiData={kpiData} />
        <ComplianceAlertPanel alertData={alertData} />
      </section>

      {/* Flowchart Alur Data */}
      <section className="mx-auto max-w-7xl px-8 py-4">
        <DataFlowChart />
      </section>

      {/* Data Table Lintas Bidang */}
      <section className="mx-auto max-w-7xl px-8 py-4">
        <LintasBidangTable tableData={tableData} />
      </section>

      {/* Quick Action Bar */}
      <section className="mx-auto max-w-7xl px-8 py-4">
        <QuickActionBar />
      </section>

      {/* AI/Feedback Panel & Open Data */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-4">
        <AIFeedbackPanel />
        <OpenDataPortal />
      </section>
    </div>
  );
}
