import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { normalizeRoleKey } from "../utils/normalizeRole";
import RegulasiTransactionApplyPanel from "../components/master/RegulasiTransactionApplyPanel.jsx";

export default function RegulasiTransactionMigrationPage() {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRoleKey(user);

  if (role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-1">Migrasi transaksi regulasi</h1>
      <p className="text-sm text-muted mb-6">
        Preview, apply, dan rollback referensi master pada tabel anggaran (DPA, RKA, SPJ). Hanya super admin.
      </p>
      <RegulasiTransactionApplyPanel />
    </div>
  );
}
