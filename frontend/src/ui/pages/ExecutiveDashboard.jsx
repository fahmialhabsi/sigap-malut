import React from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiRow from "../components/DashboardKpiRow";
import AlertRail from "../components/AlertRail";
import TimeseriesPanel from "../components/TimeseriesPanel";
import MapKerawanan from "../components/MapKerawanan";
import KomoditasTable from "../components/KomoditasTable";
import AuditTimeline from "../components/AuditTimeline";
import AIAssistantPanel from "../components/AIAssistantPanel";
import DataTable from "../components/DataTable";

export default function ExecutiveDashboard({
  kpis,
  alerts,
  timeseries,
  mapData,
  komoditas,
  audit,
  aiChat,
  docs,
  onKpiClick,
  onAlertAction,
  onExport,
  onMapRegionClick,
  onKomoditasAction,
  onAuditAction,
  onAISend,
  onAIAction,
  onDocAction,
}) {
  return (
    <>
      <DashboardHeader
        title="Dashboard Eksekutif"
        subtitle="Pantau KPI, alert, dan aktivitas SIGAP Malut secara real-time"
        filters={null}
        actions={null}
      />
      <DashboardKpiRow kpis={kpis} onKpiClick={onKpiClick} />
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-4">
          <AlertRail alerts={alerts} onAction={onAlertAction} />
        </div>
        <div className="col-span-5">
          <TimeseriesPanel
            title="Trend Inflasi"
            series={timeseries}
            controls={null}
            onExport={onExport}
          />
        </div>
        <div className="col-span-3">
          <MapKerawanan
            geoData={mapData}
            layers={null}
            onRegionClick={onMapRegionClick}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-6">
          <KomoditasTable data={komoditas} onAction={onKomoditasAction} />
        </div>
        <div className="col-span-6">
          <AuditTimeline items={audit} onAction={onAuditAction} />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-6">
          <AIAssistantPanel
            chatHistory={aiChat}
            onSend={onAISend}
            onAction={onAIAction}
          />
        </div>
        <div className="col-span-6">
          <DataTable
            columns={[
              { key: "doc", label: "Dokumen" },
              { key: "status", label: "Status" },
              { key: "date", label: "Tanggal" },
            ]}
            data={docs}
            onRowAction={onDocAction}
          />
        </div>
      </div>
    </>
  );
}
