import React from "react";

export default function QuickActionPanel() {
  return (
    <div className="bg-green-400/95 rounded-2xl w-[120px] h-[180px] flex flex-col items-center justify-center gap-1">
      <span className="text-white text-base font-semibold mb-2">
        Quick Actions
      </span>
      <span className="text-white text-xs">Restore</span>
      <span className="text-white text-xs">Broadcast</span>
      <span className="text-white text-xs">QA Report</span>
      <span className="text-white text-xs">ML Details</span>
    </div>
  );
}
