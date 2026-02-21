import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

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

// Modal component (didefinisikan di luar fungsi utama)
function Modal({ open, title, content, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-ink rounded-lg shadow-lg p-6 max-w-md w-full">
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
}

function DashboardSuperAdmin() {
  const [modules, setModules] = useState([]);
  const [modal, setModal] = useState({ open: false, title: "", content: "" });
  const navigate = useNavigate();

  // Fungsi download dummy PDF
  const handleDownloadReport = () => {
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

  const handleOpenInbox = () => {
    if (window && window.location && window.location.pathname !== "/ai-inbox") {
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

  return (
    <DashboardLayout>
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
        <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-4">
          {modules
            .filter((m) => m.is_active === "true")
            .map((modul) => (
              <div
                key={modul.modul_id}
                className="bg-white dark:bg-muted rounded-2xl shadow-lg p-6 min-h-[220px] flex flex-col justify-between border border-gray-100 dark:border-muted hover:shadow-xl hover:scale-[1.03] transition cursor-pointer"
                onClick={() => navigate(`/modul/${modul.modul_id}`)}
                title={`Buka modul ${modul.nama_modul}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                      <i className={`ph ph-${modul.icon || "app-window"}`}></i>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent mb-1">
                    {modul.kategori} &middot; {modul.bidang}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-surface mb-2 line-clamp-3">
                    {modul.deskripsi}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {modul.has_approval === "true" && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs dark:bg-yellow-900 dark:text-yellow-200">
                      Approval
                    </span>
                  )}
                  {modul.has_file_upload === "true" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs dark:bg-green-900 dark:text-green-200">
                      File Upload
                    </span>
                  )}
                  {modul.is_public === "true" && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs dark:bg-blue-900 dark:text-blue-200">
                      Publik
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
        <DashboardKpiRow kpis={superAdminKpis} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="font-bold text-lg mb-2 dark:text-surface">
                Semua Modul Aktif
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {modules
                  .filter((m) => m.is_active === "true")
                  .map((modul) => (
                    <div
                      key={modul.modul_id}
                      className="bg-white dark:bg-muted rounded-2xl shadow-lg p-6 min-h-[220px] flex flex-col justify-between border border-gray-100 dark:border-muted hover:shadow-xl hover:scale-[1.03] transition cursor-pointer"
                      onClick={() => navigate(`/modul/${modul.modul_id}`)}
                      title={`Buka modul ${modul.nama_modul}`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                            <i
                              className={`ph ph-${modul.icon || "app-window"}`}
                            ></i>
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-accent mb-1">
                          {modul.kategori} &middot; {modul.bidang}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-surface mb-2 line-clamp-3">
                          {modul.deskripsi}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {modul.has_approval === "true" && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs dark:bg-yellow-900 dark:text-yellow-200">
                            Approval
                          </span>
                        )}
                        {modul.has_file_upload === "true" && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs dark:bg-green-900 dark:text-green-200">
                            File Upload
                          </span>
                        )}
                        {modul.is_public === "true" && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs dark:bg-blue-900 dark:text-blue-200">
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
      </div>
    </DashboardLayout>
  );
}

export default DashboardSuperAdmin;
