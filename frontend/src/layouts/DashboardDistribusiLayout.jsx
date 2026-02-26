import React from "react";

export default function DashboardDistribusiLayout() {
  // Data dummy modul distribusi
  const distribusiModules = [
    {
      modul: "Kebijakan Distribusi",
      status: "Valid",
      lastUpdate: "2026-02-22",
      penanggungJawab: "Kabid Distribusi",
      color: "bg-yellow-900 text-yellow-100",
    },
    {
      modul: "Monitoring Distribusi",
      status: "Valid",
      lastUpdate: "2026-02-22",
      penanggungJawab: "Staff Distribusi",
      color: "bg-yellow-800 text-yellow-100",
    },
    {
      modul: "Harga & Stabilisasi",
      status: "Perlu Validasi",
      lastUpdate: "2026-02-21",
      penanggungJawab: "Petugas Harga",
      color: "bg-yellow-700 text-yellow-100",
    },
    {
      modul: "Cadangan Pangan Daerah (CPPD)",
      status: "Valid",
      lastUpdate: "2026-02-20",
      penanggungJawab: "Staff CPPD",
      color: "bg-yellow-600 text-yellow-100",
    },
    {
      modul: "Bimbingan & Pendampingan",
      status: "Valid",
      lastUpdate: "2026-02-19",
      penanggungJawab: "Staff Bimtek",
      color: "bg-yellow-500 text-yellow-100",
    },
    {
      modul: "Evaluasi & Monitoring",
      status: "Revisi",
      lastUpdate: "2026-02-18",
      penanggungJawab: "Staff Monev",
      color: "bg-yellow-400 text-yellow-900",
    },
    {
      modul: "Pelaporan Kinerja",
      status: "Valid",
      lastUpdate: "2026-02-17",
      penanggungJawab: "Staff Pelaporan",
      color: "bg-yellow-300 text-yellow-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Modul Distribusi */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-8">
        {distribusiModules.map((modul, idx) => (
          <div
            key={modul.modul}
            className={`rounded-xl shadow p-6 flex flex-col gap-2 ${modul.color}`}
          >
            <div className="font-bold text-xl mb-2">{modul.modul}</div>
            <div className="flex flex-row gap-4 items-center mb-2">
              <span className="text-sm font-semibold">Status:</span>
              <span className="text-base font-bold">{modul.status}</span>
            </div>
            <div className="flex flex-row gap-4 items-center mb-2">
              <span className="text-sm font-semibold">Update Terakhir:</span>
              <span className="text-base">{modul.lastUpdate}</span>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="text-sm font-semibold">Penanggung Jawab:</span>
              <span className="text-base">{modul.penanggungJawab}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
    </div>
  );
}

function ExecutiveSummaryPanel({ kpiData }) {
  return (
    <div className="col-span-2 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2">Executive Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center"
          >
            <span className="text-2xl font-bold">{kpi.value}</span>
            <span className="text-xs text-yellow-700">{kpi.label}</span>
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
            className={`p-2 rounded ${alert.type === "danger" ? "bg-red-100 text-red-700" : alert.type === "warning" ? "bg-yellow-100 text-yellow-800" : "bg-yellow-50 text-yellow-700"}`}
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
      <h3 className="font-bold text-lg mb-4">Alur Data Distribusi</h3>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center gap-4">
          {[
            {
              label: "Pelaksana",
              color: "bg-yellow-200 text-yellow-800",
              desc: "Input Data",
            },
            {
              label: "Fungsional",
              color: "bg-yellow-200 text-yellow-800",
              desc: "Validasi Teknis",
            },
            {
              label: "Staff Distribusi",
              color: "bg-yellow-200 text-yellow-800",
              desc: "Distribusi Lapangan",
            },
            {
              label: "Kabid Distribusi",
              color: "bg-yellow-500 text-white",
              desc: "Koordinasi & Monitoring",
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

function ModulDistribusiTable({ tableData }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">
        Modul & Status Layanan Distribusi
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-yellow-50 text-yellow-700">
              <th className="px-4 py-2 text-left">Modul</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Update Terakhir</th>
              <th className="px-4 py-2 text-left">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="px-4 py-2">{row.modul}</td>
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
      <button className="bg-yellow-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-800">
        Upload Dokumen
      </button>
      <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-green-700">
        Generate Laporan
      </button>
      <button className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-600">
        Broadcast
      </button>
      <button className="bg-gray-100 text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-50 border border-yellow-200">
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
        Rekomendasi AI: Distribusi berjalan normal. Tidak ada hambatan kritis.
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1">Laporan Masalah/Feedback:</label>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Tulis feedback atau masalah di sini..."
        />
        <button className="mt-2 bg-yellow-700 text-white px-3 py-1 rounded font-semibold hover:bg-yellow-800">
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
        Ringkasan data publik distribusi tersedia untuk diunduh:
      </div>
      <div className="flex gap-2">
        <button className="bg-gray-100 text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-50 border border-yellow-200">
          Download Excel
        </button>
        <button className="bg-gray-100 text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-50 border border-yellow-200">
          Download PDF
        </button>
        <button className="bg-gray-100 text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-50 border border-yellow-200">
          Download CSV
        </button>
      </div>
    </div>
  );
}
