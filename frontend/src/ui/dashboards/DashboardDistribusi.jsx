import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import DashboardDistribusiLayout from "../../layouts/DashboardDistribusiLayout";

export default function DashboardDistribusi() {
  const user = useAuthStore((state) => state.user);

  const distribusiModules = [
    { id: "D001", name: "Data pasar" },
    { id: "D002", name: "Harga pangan" },
    // Tambahkan modul lain sesuai kebutuhan
  ];

  useEffect(() => {
    if (user && user.role === "kepala_bidang_distribusi") {
      workflowStatusUpdateAPI({
        user,
        modulId: "D001",
        status: "akses",
        detail: "Akses modul Data pasar",
      });
    }
  }, [user]);

  if (
    !user ||
    !(
      user.role === "kepala_bidang_distribusi" ||
      user.unit_kerja === "Bidang Distribusi" ||
      user.role === "super_admin"
    )
  ) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardDistribusiLayout>
      {/* Konten dashboard distribusi: KPI, tabel, dsb. Tanpa header dan subjudul */}
      {/* ...masukkan panel-panel dashboard di sini... */}
    </DashboardDistribusiLayout>
  );
}
