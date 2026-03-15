import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import DashboardDistribusiLayout from "../../layouts/DashboardDistribusiLayout";
import distribusiModules from "../../data/distribusiModules";
import { roleIdToName } from "../../utils/roleMap";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardDistribusi() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  // local fallback modules loaded from master-data
  const _distribusiModules = distribusiModules;

  useEffect(() => {
    if (user && roleName === "kepala_bidang_distribusi") {
      workflowStatusUpdateAPI({
        user,
        modulId: "D001",
        status: "draft",
        detail: "Akses modul Data pasar",
      });
    }
  }, [user, roleName]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "kepala_bidang_distribusi" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja === "bidang distribusi");

  if (!isAllowed) return <Navigate to="/" replace />;

  return (
    <DashboardDistribusiLayout fallbackModules={_distribusiModules}>
      {/* Konten dashboard distribusi dirender oleh layout */}
      {/* Jika ingin panel tambahan, tambahkan di sini */}
    </DashboardDistribusiLayout>
  );
}
