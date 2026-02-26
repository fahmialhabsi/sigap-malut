import React from "react";

export default function MissionControlPanels() {
  return (
    <section className="flex gap-6 px-8 mb-4">
      {/* Panel kiri besar */}
      <div className="bg-white rounded-2xl border-2 border-yellow-400/90 w-[900px] h-[230px] flex flex-col justify-between p-6 opacity-100">
        <span className="text-lg font-bold text-[#233441] text-center mb-2">
          Mission Control · App/Infra/API/DB/Audit
        </span>
        <div className="flex gap-4">
          {/* Live Feed */}
          <div className="bg-green-600/15 rounded-xl w-[430px] h-[146px] flex flex-col items-center justify-center mr-4">
            <span className="text-green-900 text-sm font-medium">
              Live Event Feed
            </span>
          </div>
          {/* Pie Role/Role Activity */}
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-[120px] h-[90px] rounded-full bg-blue-600/10 flex items-center justify-center mb-2" />
            <span className="text-green-700 text-base">User by Role</span>
          </div>
        </div>
      </div>
      {/* Panel kanan besar */}
      <div className="bg-white rounded-2xl border-2 border-green-600/80 w-[480px] h-[230px] flex flex-col justify-between p-6 opacity-95 relative">
        <span className="text-blue-600 font-bold text-base mb-2">
          API Health
        </span>
        <div className="absolute right-8 top-8 w-[120px] h-[90px] rounded-full bg-blue-300/10" />
        <span className="text-teal-500 text-sm text-center">REST latency</span>
        <span className="text-gray-800 text-xs absolute right-8 bottom-8">
          OK: 99%
        </span>
      </div>
    </section>
  );
}
