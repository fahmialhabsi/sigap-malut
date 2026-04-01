import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

// Custom hook for Sekretaris dashboard data & periodic updates
export const useSekretarisDashboard = () => {
  const [kpi, setKpi] = useState({});
  const [inboxCount, setInboxCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [bypassCount, setBypassCount] = useState(0);
  const [kgbAlertCount, setKgbAlertCount] = useState(0);
  const [kinerjaAvg, setKinerjaAvg] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);

      const [sekretarisRes, kpiRes, kgbRes] = await Promise.all([
        // Hitung inbox KaDin, approval queue, SLA khusus Sekretaris
        api.get("/api/sekretaris/dashboard/summary"),
        // KPI 50 indikator + bypass dari controller umum dashboard
        api.get("/api/dashboard/sekretaris/summary"),
        // KGB jatuh tempo <30 hari
        api.get("/api/sekretaris/dashboard/kgb-alert/count"),
      ]);

      const sekretarisData = sekretarisRes.data?.data || sekretarisRes.data || {};
      const kpiData = kpiRes.data?.data || kpiRes.data || {};
      const kgbData = kgbRes.data?.data || kgbRes.data || {};

      // Set Hero KPI detail
      setKpi({
        ...kpiData,
        // Normalisasi nama field SLA agar konsisten di frontend
        slaCompliance:
          typeof sekretarisData.sla_compliance === "number"
            ? sekretarisData.sla_compliance
            : kpiData.slaCompliance ?? 0,
      });

      // Hitung badge count
      setInboxCount(sekretarisData.inbox_kadin || 0);
      setApprovalCount(sekretarisData.approval_queue || 0);
      setBypassCount(
        typeof kpiData.zeroBypassViolations30d === "number"
          ? kpiData.zeroBypassViolations30d
          : 0,
      );
      setKgbAlertCount(kgbData.count || 0);

      // Placeholder kinerja rata-rata bawahan — akan diisi setelah endpoint siap
      setKinerjaAvg(kpiData.kinerjaAvg ?? null);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 300000); // 5 menit
    return () => clearInterval(interval);
  }, [fetchSummary]);

  return {
    kpi,
    inboxCount,
    approvalCount,
    bypassCount,
    kgbAlertCount,
    kinerjaAvg,
    loading,
    refetch: fetchSummary,
  };
};

export default useSekretarisDashboard;
