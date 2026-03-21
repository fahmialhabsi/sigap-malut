import React from "react";
import SidebarMenu from "../components/SidebarMenu";
import KpiTile from "../components/KpiTile";
import DataTable from "../components/DataTable";
import ActivityFeed from "../components/ActivityFeed";
import AIInbox from "../components/AIInbox";

export default function DashboardEnterpriseTemplate({
  title = "Dashboard SIGAP-MALUT",
  user = {},
  kpiList = [],
  tableColumns = [],
  tableData = [],
  activityList = [],
  aiInboxList = [],
  sidebarItems = [],
  chartSlot = null,
  rightPanelSlot = null,
}) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F6F7FB] dark:bg-background-main transition-colors duration-300 overflow-x-hidden overflow-y-auto">
      <header className="bg-white dark:bg-background-panel dark:text-text-main px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20 border-0 shadow-none">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="SIGAP" className="w-8 h-8" />
          <h1 className="font-bold text-lg text-primary dark:text-primary">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">{/* slot */}</div>
      </header>

      <div className="flex-1 flex flex-row w-full bg-transparent dark:bg-background-main overflow-x-hidden">
        <aside className="bg-white dark:bg-background-panel dark:text-text-main shadow-none w-16 md:w-60 xl:w-64 p-0 md:p-4 pt-4 min-h-screen hidden md:flex transition-colors duration-300">
          <SidebarMenu items={sidebarItems} currentRole={user?.role} />
        </aside>

        <main className="flex-1 flex flex-col px-2 sm:px-4 md:px-8 py-4 gap-4 w-full transition-colors duration-300 overflow-x-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 xl:gap-6 mb-1 w-full">
            {kpiList.map((kpi, i) => (
              <KpiTile key={i} {...kpi} />
            ))}
          </div>

          <div className="w-full flex flex-wrap gap-4 justify-between">
            {chartSlot && (
              <div className="flex-1 min-w-[300px] bg-white dark:bg-background-card rounded-xl shadow p-4 transition-colors duration-300">
                {chartSlot}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="col-span-2 bg-white dark:bg-background-card rounded-xl shadow p-4 min-h-[220px] transition-colors duration-300 overflow-x-auto w-full">
              <h2 className="font-semibold text-base mb-3 dark:text-text-main">
                Rekap Data
              </h2>
              <DataTable columns={tableColumns} data={tableData} />
            </div>

            <div className="flex flex-col gap-4 w-full">
              <ActivityFeed items={activityList} />
              <AIInbox items={aiInboxList} />
              {rightPanelSlot}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
