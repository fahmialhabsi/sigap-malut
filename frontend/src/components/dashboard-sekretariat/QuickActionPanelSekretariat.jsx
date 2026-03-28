import React from "react";
import BukaEPelaraButton from "../BukaEPelaraButton";

export default function QuickActionPanelSekretariat() {
  return (
    <div className="bg-[#181F2A] rounded-2xl shadow-lg w-full min-h-[75px] p-6 flex flex-col gap-4">
      <span className="text-yellow-300 font-bold text-base text-left">
        Quick Action
      </span>
      <BukaEPelaraButton
        label="Buka e-Pelara (Perencanaan)"
        targetPath="/renstra"
        className="w-full justify-center"
      />
    </div>
  );
}
