import React from "react";
import {
  triggerMasterDataSync,
  syncMasterDataOnce,
  getSyncStats,
} from "../services/masterDataSyncService";

export default function MasterDataSyncPanel() {
  const [notif, setNotif] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [stats, setStats] = React.useState(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const stats = await getSyncStats();
      setStats(stats);
      setStatus("Statistik sinkronisasi berhasil diambil.");
    } catch {
      setStatus("Gagal cek status.");
      setStats(null);
    }
    setLoading(false);
  };

  return (
    <div className="border rounded p-4 bg-gray-50 max-w-md mx-auto mt-8">
      <h3 className="font-bold mb-2">Sinkronisasi Master-Data/Evidence</h3>
      <div className="mb-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          onClick={async () => {
            setLoading(true);
            try {
              await triggerMasterDataSync();
              setNotif("Sinkronisasi otomatis dimulai.");
            } catch {
              setNotif("Gagal trigger sinkronisasi.");
            }
            setLoading(false);
          }}
          disabled={loading}
        >
          Trigger Otomatis
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={async () => {
            setLoading(true);
            try {
              await syncMasterDataOnce();
              setNotif("Sinkronisasi manual selesai.");
            } catch {
              setNotif("Gagal sinkronisasi manual.");
            }
            setLoading(false);
          }}
          disabled={loading}
        >
          Sync Sekali
        </button>
      </div>
      <div className="mb-2">
        <button
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
          onClick={checkStatus}
          disabled={loading}
        >
          Cek Status
        </button>
      </div>
      {notif && (
        <div className="mb-2 text-sm text-green-700 bg-green-100 rounded px-3 py-2">
          {notif}
        </div>
      )}
      {status && (
        <div className="text-sm text-blue-700 bg-blue-100 rounded px-3 py-2">
          Status: {status}
        </div>
      )}
      {stats && (
        <div className="mt-2 text-xs bg-gray-100 rounded px-3 py-2">
          <div>
            <b>Statistik Sinkronisasi:</b>
          </div>
          <div>Unit Kerja: {stats.unit_kerja}</div>
          <div>Total Integrasi: {stats.total_integrations}</div>
          <div>Success Rate: {stats.success_rate}%</div>
          <div>
            Last Sync:{" "}
            {stats.last_sync ? new Date(stats.last_sync).toLocaleString() : "-"}
          </div>
          <div>Pending Reports: {stats.pending_reports}</div>
        </div>
      )}
    </div>
  );
}
