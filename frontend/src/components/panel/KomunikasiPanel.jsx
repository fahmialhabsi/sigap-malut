import React, { useState } from "react";
import TanggapanBawahanPanel from "./TanggapanBawahanPanel.jsx";
import ClarificationThreadPanel, {
  ANCHOR,
  LANES,
} from "../clarification/ClarificationThreadPanel.jsx";

/**
 * Panel gabungan: daftar tanggapan dari bawahan + diskusi pada satu task.
 * @param {string} lane — salah satu LANES (default es3_es4 untuk pimpinan unit).
 */
export default function KomunikasiPanel({
  lane = LANES.ES3_ES4,
  titleTanggapan = "Tanggapan dari bawahan",
  titleDiskusi = "Diskusi / tanya jawab (task)",
}) {
  const [taskId, setTaskId] = useState("");

  const idNum = taskId ? Number(taskId) : null;

  return (
    <div className="space-y-6">
      <TanggapanBawahanPanel title={titleTanggapan} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800">{titleDiskusi}</h2>
        <p className="text-xs text-gray-500 mt-1 mb-3">
          Masukkan ID tugas (task) yang Anda keluarkan, lalu kirim pesan ke
          penerima atau perekam tanggapan.
        </p>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          ID Task
        </label>
        <input
          type="number"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
          placeholder="Contoh: 42"
        />
        <ClarificationThreadPanel
          anchorType={ANCHOR.TASK}
          anchorId={idNum}
          lane={lane}
          compact
        />
      </div>
    </div>
  );
}

export { LANES };
