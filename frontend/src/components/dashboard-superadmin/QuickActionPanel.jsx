import React from "react";

export default function QuickActionPanel() {
  return (
    <div className="bg-slate-900 backdrop-blur-md border border-slate-800/85 rounded-2xl w-[120px] h-[180px] flex flex-col items-center justify-center gap-1">
      <span className="text-slate-200 text-base font-semibold mb-2">
        Quick Actions
      </span>
      <span className="text-slate-300 text-xs">Restore</span>
      <span className="text-slate-300 text-xs">Broadcast</span>
      <span className="text-slate-300 text-xs">QA Report</span>
      <span className="text-slate-300 text-xs">ML Details</span>
    </div>
  );
}
