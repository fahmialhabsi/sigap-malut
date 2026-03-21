import React from "react";

export default function MissionControlPanels() {
  return (
    <section className="flex gap-6 px-8 mb-4">
      {/* Panel kiri besar */}
      <div className="bg-slate-950/88 backdrop-blur-md rounded-2xl border-2 border-yellow-400/90 w-[900px] h-[230px] flex flex-col justify-between p-6">
        <span className="text-lg font-bold text-slate-200 text-center mb-2">
          Mission Control · App/Infra/API/DB/Audit
        </span>
        <div className="flex gap-4">
          {/* Live Feed */}
          <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl w-[430px] h-[146px] flex flex-col items-center justify-center mr-4">
            <span className="text-emerald-300 text-sm font-medium">
              Live Event Feed
            </span>
          </div>
          {/* Pie Role/Role Activity */}
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-[120px] h-[90px] rounded-full bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-2" />
            <span className="text-blue-300 text-base">User by Role</span>
          </div>
        </div>
      </div>
      {/* Panel kanan besar */}
      <div className="bg-slate-950/88 backdrop-blur-md rounded-2xl border-2 border-emerald-600/80 w-[480px] h-[230px] flex flex-col justify-between p-6 relative">
        <span className="text-blue-400 font-bold text-base mb-2">
          API Health
        </span>
        <div className="absolute right-8 top-8 w-[120px] h-[90px] rounded-full bg-blue-950/50 border border-blue-800/50" />
        <span className="text-teal-400 text-sm text-center">REST latency</span>
        <span className="text-slate-300 text-xs absolute right-8 bottom-8">
          OK: 99%
        </span>
      </div>
    </section>
  );
}
