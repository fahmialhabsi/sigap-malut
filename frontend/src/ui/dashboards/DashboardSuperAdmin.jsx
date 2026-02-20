import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper untuk parse CSV sederhana
function parseCSV(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // handle koma dalam kutip
    const obj = {};
    keys.forEach(
      (k, i) =>
        (obj[k.trim()] = (values[i] || "").replace(/^"|"$/g, "").trim()),
    );
    return obj;
  });
}

import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiRow from "../components/DashboardKpiRow";
import AlertRail from "../components/AlertRail";
import {
  superAdminKpis,
  superAdminAlerts,
} from "../components/SuperAdminKpiMock";

function DashboardSuperAdmin() {
  const [modules, setModules] = useState([]);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });
  const navigate = useNavigate();

  // Fungsi download dummy PDF
  const handleDownloadReport = () => {
    // Buat file PDF dummy (base64 minimal)
    const pdfBase64 =
      "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDQgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDQzPj4Kc3RyZWFtCkJUIAovRjEgMjQgVGYKMTAgNzAwIFRECi9IZWxsbywgTWVuZGFncmkgUmVwb3J0IQplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxMTAgMDAwMDAgbiAKMDAwMDAwMDE2MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA1Pj4Kc3RhcnR4cmVmCjE3OQolJUVPRgo=";
    const link = document.createElement("a");
    link.href = "data:application/pdf;base64," + pdfBase64;
    link.download = "Laporan_Mendagri_SIGAP.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setModal({
      open: true,
      title: "Laporan Diunduh",
      content: "File dummy laporan Mendagri berhasil diunduh.",
    });
  };

  // Fungsi buka AI Inbox
  const handleOpenInbox = () => {
    // Jika route /ai-inbox ada, redirect. Jika tidak, tampilkan modal info.
    if (window && window.location && window.location.pathname !== "/ai-inbox") {
      // Cek apakah route ada (dummy, karena SPA biasanya handle sendiri)
      // Untuk demo, langsung redirect
      navigate("/ai-inbox");
    } else {
      setModal({
        open: true,
        title: "AI Inbox",
        content: "Fitur AI Inbox akan segera tersedia.",
      });
    }
  };

  useEffect(() => {
    fetch("/master-data/00_MASTER_MODUL_CONFIG.csv")
      .then((res) => res.text())
      .then((text) => setModules(parseCSV(text)));
  }, []);

  // Modal komponen sederhana
  const Modal = ({ open, title, content, onClose }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="font-bold text-lg mb-2">{title}</div>
          <div className="mb-4">{content}</div>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Modal
        open={modal.open}
        title={modal.title}
        content={modal.content}
        onClose={() => setModal({ ...modal, open: false })}
      />
      <DashboardHeader
        title="Dashboard Super Admin"
        subtitle="Executive Control Center — Semua Modul, KPI, dan Alert"
        actions={[
          <button
            key="gen-report"
            className="bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleDownloadReport}
          >
            Generate Mendagri Report
          </button>,
          <button
            key="open-inbox"
            className="bg-gray-100 text-blue-700 px-4 py-2 rounded font-semibold shadow hover:bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleOpenInbox}
          >
            Open AI Inbox
          </button>,
        ]}
      />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {modules
          .filter((m) => m.is_active === "true")
          .map((modul) => (
            <div
              key={modul.modul_id}
              className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/modul/${modul.modul_id}`)}
              title={`Buka modul ${modul.nama_modul}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                  <i className={`ph ph-${modul.icon || "app-window"}`}></i>
                </span>
                <span className="font-bold text-base flex-1">
                  {modul.nama_modul}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {modul.kategori} &middot; {modul.bidang}
              </div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                {modul.deskripsi}
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {modul.has_approval === "true" && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                    Approval
                  </span>
                )}
                {modul.has_file_upload === "true" && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    File Upload
                  </span>
                )}
                {modul.is_public === "true" && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    Publik
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
      <DashboardKpiRow kpis={superAdminKpis} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="font-bold text-lg mb-2">Semua Modul Aktif</div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {modules
                .filter((m) => m.is_active === "true")
                .map((modul) => (
                  <div
                    key={modul.modul_id}
                    className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/modul/${modul.modul_id}`)}
                    title={`Buka modul ${modul.nama_modul}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                        <i
                          className={`ph ph-${modul.icon || "app-window"}`}
                        ></i>
                      </span>
                      <span className="font-bold text-base flex-1">
                        {modul.nama_modul}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {modul.kategori} &middot; {modul.bidang}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {modul.deskripsi}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {modul.has_approval === "true" && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                          Approval
                        </span>
                      )}
                      {modul.has_file_upload === "true" && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          File Upload
                        </span>
                      )}
                      {modul.is_public === "true" && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          Publik
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div>
          <AlertRail alerts={superAdminAlerts} />
        </div>
      </div>
      {/* Recent Activity/Audit log, Quick links, dsb bisa ditambahkan di bawah ini */}
    </div>
  );
}

export default DashboardSuperAdmin;
