/**
 * SelfServiceAnalyticsPage — Halaman analytics filter mandiri
 * Route: /analytics
 * Dokumen sumber: 05-Dashboard-Template-Standar.md
 */

import DashboardLayout from "../layouts/DashboardLayout";
import SelfServiceAnalytics from "../components/analytics/SelfServiceAnalytics";

export default function SelfServiceAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Analytics Mandiri
        </h1>
        <SelfServiceAnalytics />
      </div>
    </DashboardLayout>
  );
}
