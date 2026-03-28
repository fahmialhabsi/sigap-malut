/**
 * ModuleWizardPage — Halaman wizard pembuatan modul baru
 * Route: /module-wizard
 * Dokumen sumber: 03-dashboard-uiux.md
 */

import DashboardLayout from "../layouts/DashboardLayout";
import ModuleWizard from "../components/wizard/ModuleWizard";

export default function ModuleWizardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Buat Modul Baru
        </h1>
        <ModuleWizard />
      </div>
    </DashboardLayout>
  );
}
