console.log("Loaded: DashboardKetersediaan wrapper");
// frontend/src/ui/dashboards/DashboardKetersediaan.jsx
import React from "react";
import DashboardKetersediaanLayout from "../../layouts/DashboardKetersediaanLayout";
import ketersediaanModules from "../../data/ketersediaanModules";

// Wrapper: re-export layout yang baru sehingga route yang sudah ada tetap bekerja.
// Jika Anda ingin menyimpan implementasi lama (dashboard ringkas), lihat DashboardKetersediaanLegacy.jsx
export default function DashboardKetersediaan(props) {
  return (
    <DashboardKetersediaanLayout
      fallbackModules={ketersediaanModules}
      {...props}
    />
  );
}
