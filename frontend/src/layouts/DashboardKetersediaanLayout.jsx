import React, { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

export default function DashboardKetersediaan() {
  const user = useAuthStore((state) => state.user);
  const roleName = user ? roleIdToName[user.role_id] : null;

  useEffect(() => {
    if (
      !user ||
      !(
        roleName === "kepala_bidang_ketersediaan" ||
        roleName === "super_admin" ||
        user.unit_kerja === "Bidang Ketersediaan"
      )
    ) {
      window.location.href = "/landing";
    }
  }, [user, roleName]);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-green-800 font-inter">
      {/* Sidebar */}
      <aside className="w-20 bg-green-700 flex flex-col items-center py-6 space-y-5">
        {/* LOGO */}
        <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mb-8">
          {/* Replace below with <img src={logoUrl} ... /> if available */}
          <span className="text-green-800 font-bold text-xs">LOGO</span>
        </div>
        {/* Menu Modules */}
        <SidebarItem label="Dash" />
        <SidebarItem label="Stok" />
        <SidebarItem label="Gudang" />
        <SidebarItem label="Produksi" />
        <SidebarItem label="Target" />
        <SidebarItem label="Laporan" />
        <SidebarItem label="Approve" />
        <SidebarItem label="Agenda" />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-green-800 flex items-center px-8 shadow">
          <h1 className="text-2xl text-white font-bold tracking-wide flex-1">
            SIGAP · Bidang Ketersediaan
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <ProfileAvatar />
          </div>
        </header>

        <main className="flex-1 px-8 py-4 space-y-6">
          {/* HERO ROW */}
          <div className="grid grid-cols-6 gap-4">
            <KpiCard title="Stok Total" color="green" />
            <KpiCard title="Stok Kritis" color="blue" />
            <KpiCard title="Produksi Hari Ini" color="yellow" />
            <KpiCard title="Target Bulan" color="red" />
            <KpiCard title="Backlog Gudang" color="blue" />
            <KpiCard title="Approval Pending" color="yellow" />
          </div>

          {/* PANEL ROW 1 */}
          <div className="grid grid-cols-2 gap-6">
            <PanelBox title="Tabel Stok By Komoditas">
              <FakeTable label1="Komoditas" label2="Stok" />
            </PanelBox>
            <PanelBox title="Grafik Tren Stok">
              <PlaceholderChart />
            </PanelBox>
          </div>

          {/* PANEL ROW 2 */}
          <div className="grid grid-cols-2 gap-6">
            <PanelBox title="Log Produksi/Mutasi">
              <FakeList />
            </PanelBox>
            <PanelBox title="Approval Stok">
              <FakeTable label1="Nama" label2="Status" />
            </PanelBox>
          </div>

          {/* NOTIF KRITIS */}
          <PanelBox title="Notifikasi Kritis">
            <ul className="text-red-700 space-y-1">
              <li>
                Stok Beras di Gudang A{" "}
                <span className="font-semibold">di bawah minimum!</span>
              </li>
              <li>Pengajuan Mutasi belum approve 2 hari</li>
              <li>Perubahan target produksi bulan ini</li>
            </ul>
          </PanelBox>
        </main>
        <footer className="h-8 bg-green-800 flex items-center text-xs text-yellow-200 px-10">
          SIGAP Malut v1 | Bidang Ketersediaan
        </footer>
      </div>
    </div>
  );
}

// Reusable Components

function SidebarItem({ label }) {
  return (
    <button className="w-10 h-10 text-xs text-green-900 bg-green-100 rounded-lg shadow hover:bg-green-300 mb-1">
      {label}
    </button>
  );
}

function KpiCard({ title, color }) {
  const bg =
    color === "green"
      ? "bg-green-100 border-green-700"
      : color === "blue"
        ? "bg-blue-100 border-blue-700"
        : color === "yellow"
          ? "bg-yellow-100 border-yellow-500"
          : color === "red"
            ? "bg-red-100 border-red-500"
            : "bg-gray-100 border-gray-300";
  return (
    <div
      className={`rounded-lg border-2 shadow flex flex-col items-center py-4 px-2 ${bg}`}
    >
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-2xl font-bold text-gray-800">123</div>
    </div>
  );
}

function PanelBox({ title, children }) {
  return (
    <section className="rounded-xl bg-white/90 shadow p-4 flex flex-col mb-2 border border-green-200">
      <h2 className="font-bold text-green-800 mb-2">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function FakeTable({ label1, label2 }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th className="text-left">{label1}</th>
          <th className="text-left">{label2}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Beras</td>
          <td>2100 kg</td>
        </tr>
        <tr>
          <td>Jagung</td>
          <td>700 kg</td>
        </tr>
      </tbody>
    </table>
  );
}

function FakeList() {
  return (
    <ul className="pl-4 text-xs list-disc">
      <li>Mutasi masuk Gudang A</li>
      <li>Produksi Jagung 500kg</li>
      <li>Input OP</li>
    </ul>
  );
}

function NotificationBell() {
  return (
    <span className="inline-block w-7 h-7 bg-yellow-300 rounded-full flex items-center justify-center text-yellow-900">
      🔔
    </span>
  );
}

function ProfileAvatar() {
  return (
    <span className="inline-block w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-green-700">
      KB
    </span>
  );
}
