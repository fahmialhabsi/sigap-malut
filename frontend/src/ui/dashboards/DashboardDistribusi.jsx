import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import DashboardDistribusiLayout from "../../layouts/DashboardDistribusiLayout";
import distribusiModules from "../../data/distribusiModules";

export default function DashboardDistribusi() {
  const user = useAuthStore((state) => state.user);

  // local fallback modules loaded from master-data
  const _distribusiModules = distribusiModules;

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
    <DashboardDistribusiLayout fallbackModules={_distribusiModules}>
      {/* Konten dashboard distribusi: KPI, tabel, dsb. Tanpa header dan subjudul */}
      {/* ...masukkan panel-panel dashboard di sini... */}
    </DashboardDistribusiLayout>
  );
}
