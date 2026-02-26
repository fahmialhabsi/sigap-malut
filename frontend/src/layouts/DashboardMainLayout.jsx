import React from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import HeroWidgets from "../components/dashboard/HeroWidgets";
import MainTablePanel from "../components/dashboard/MainTablePanel";
import AgendaNotulensiPanel from "../components/dashboard/AgendaNotulensiPanel";
import QuickActionPanel from "../components/dashboard/QuickActionPanel";
import KepegKeuAsetPanel from "../components/dashboard/KepegKeuAsetPanel";
import Footer from "../components/dashboard/Footer";

const menu = [
  { label: "Dash", icon: "🏠" },
  { label: "SMasuk", icon: "📥" },
  { label: "SKeluar", icon: "📤" },
  { label: "Dispo", icon: "📑" },
  { label: "Agenda", icon: "📅" },
  { label: "Notul", icon: "📝" },
  { label: "Kepeg", icon: "👤" },
  { label: "Keu", icon: "💰" },
  { label: "Aset", icon: "📦" },
];

const widgets = [
  { label: "Surat Masuk", border: "border-green-600", color: "text-green-600" },
  { label: "Surat Keluar", border: "border-blue-600", color: "text-blue-600" },
  { label: "Disposisi", border: "border-yellow-400", color: "text-yellow-400" },
  { label: "Reminders", border: "border-red-500", color: "text-red-500" },
];

const tableData = [
  { jenis: "Surat Masuk", status: "Valid", tanggal: "2026-02-22" },
  { jenis: "Surat Keluar", status: "Perlu Validasi", tanggal: "2026-02-21" },
  { jenis: "Disposisi", status: "Valid", tanggal: "2026-02-20" },
  { jenis: "Agenda", status: "Revisi", tanggal: "2026-02-19" },
];

export default function DashboardMainLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-600 to-green-900 font-inter">
      <Sidebar menu={menu} active={0} />
      <Header title="Dashboard Sekretariat" user={{ initials: "SK" }} />
      <main className="pl-20 pt-16 pb-8 pr-0 min-h-[calc(100vh-2rem)]">
        <HeroWidgets widgets={widgets} />
        <div className="flex gap-6 px-8 mt-2">
          <MainTablePanel data={tableData} />
          <div className="flex flex-col gap-4">
            <AgendaNotulensiPanel />
            <QuickActionPanel />
          </div>
        </div>
        <div className="flex px-8 mt-6">
          <KepegKeuAsetPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
