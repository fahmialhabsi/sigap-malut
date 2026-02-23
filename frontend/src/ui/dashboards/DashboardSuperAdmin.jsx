import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

import DashboardHeader from "../components/DashboardHeader";

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

import useAuthStore from "../../stores/authStore";
import { Navigate } from "react-router-dom";

function DashboardSuperAdmin() {
  const user = useAuthStore((state) => state.user);
  const hasRole = (role) => user && user.role === role;
  if (!hasRole("super_admin")) return <Navigate to="/" replace />;
  // Dummy Super Admin modules
  const superAdminModules = [
    { id: "SA01", name: "Monitoring 50 indikator" },
    { id: "SA02", name: "Tool modul tanpa coding" },
    { id: "SA03", name: "Tata Naskah Dinas" },
    { id: "SA04", name: "Database peraturan" },
    { id: "SA05", name: "Manajemen User", isUserManagement: true },
    // Tambahkan modul lain sesuai kebutuhan
  ];
  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-6 py-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow">
            Dashboard Super Admin
          </h1>
          <div className="text-blue-200 text-base md:text-lg font-medium">
            Executive Control Center — Semua Modul, KPI, dan Alert
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition"
            onClick={() => alert("Generate Mendagri Report")}
          >
            <span className="inline-block align-middle mr-2">📄</span> Generate
            Mendagri Report
          </button>
          <button
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow border border-blue-200 hover:bg-blue-50 transition"
            onClick={() => alert("Open AI Inbox")}
          >
            <span className="inline-block align-middle mr-2">🤖</span> Open AI
            Inbox
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center shadow border-b-4 border-blue-400">
          <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
            50
          </span>
          <span className="text-xs mt-1 font-semibold text-blue-700 dark:text-blue-200 tracking-wide">
            Indikator Monitoring
          </span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center shadow border-b-4 border-green-400">
          <span className="text-3xl font-extrabold text-green-700 dark:text-green-300">
            100%
          </span>
          <span className="text-xs mt-1 font-semibold text-green-700 dark:text-green-200 tracking-wide">
            Compliance Alur
          </span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center shadow border-b-4 border-yellow-400">
          <span className="text-3xl font-extrabold text-yellow-700 dark:text-yellow-200">
            0
          </span>
          <span className="text-xs mt-1 font-semibold text-yellow-700 dark:text-yellow-200 tracking-wide">
            Bypass Terdeteksi
          </span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center shadow border-b-4 border-indigo-400">
          <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-200">
            99%
          </span>
          <span className="text-xs mt-1 font-semibold text-indigo-700 dark:text-indigo-200 tracking-wide">
            Data Valid
          </span>
        </div>
      </div>

      {/* Modul Section */}
      <div className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-200">
        Modul Super Admin
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {superAdminModules.map((modul, idx) =>
          modul.isUserManagement ? (
            <div
              key={modul.id}
              className="bg-white dark:bg-background-card border border-blue-100 dark:border-blue-900 rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:scale-[1.03] hover:shadow-xl transition cursor-pointer min-h-[120px] items-center justify-center"
              onClick={() => (window.location.href = "/user-management")}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">👤</span>
                <span className="font-semibold text-blue-700 dark:text-blue-200 text-base">
                  {modul.name}
                </span>
              </div>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded font-semibold text-sm shadow">
                Tambah User
              </button>
              <div className="text-xs text-muted dark:text-text-muted">
                ID: {modul.id}
              </div>
            </div>
          ) : (
            <div
              key={modul.id}
              className="bg-white dark:bg-background-card border border-blue-100 dark:border-blue-900 rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:scale-[1.03] hover:shadow-xl transition cursor-pointer min-h-[120px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">
                  {["📊", "🛠️", "📄", "🗄️"][idx % 4]}
                </span>
                <span className="font-semibold text-blue-700 dark:text-blue-200 text-base">
                  {modul.name}
                </span>
              </div>
              <div className="text-xs text-muted dark:text-text-muted">
                ID: {modul.id}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default DashboardSuperAdmin;
