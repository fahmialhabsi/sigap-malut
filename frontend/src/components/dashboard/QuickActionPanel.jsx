import React from "react";
import BukaEPelaraButton from "../BukaEPelaraButton";

export default function QuickActionPanel() {
  return (
    <div className="bg-white rounded-xl border-2 border-yellow-400 w-[335px] min-h-[75px] p-4 flex flex-col gap-3">
      <span className="text-yellow-500 font-bold text-sm text-center">
        Quick Action
      </span>
      <BukaEPelaraButton
        label="Buka e-Pelara (Perencanaan)"
        targetPath="/"
        className="w-full justify-center"
      />
    </div>
  );
}
