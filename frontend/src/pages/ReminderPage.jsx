import React, { useEffect } from "react";
import { getReminders, completeReminder } from "../utils/reminder";
import { sendNotificationAPI } from "../services/notificationService";
import api from "../services/apiClient";

export default function ReminderPage() {
  const [reminders, setReminders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await getReminders();
      setReminders((res.data || []).slice().reverse());
    } catch {
      setReminders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchReminders();
    })();
  }, []);

  const handleComplete = async (id, reminder) => {
    setLoading(true);
    try {
      await completeReminder(id);
      await sendNotificationAPI({
        user: reminder.user,
        type: "reminder-done",
        message: `Reminder untuk modul ${reminder.modulId} data ${reminder.dataId} telah selesai.`,
        target: reminder.user,
      });
      await fetchReminders();
    } catch {
      /* ignore error */
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reminder & Monitoring</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/reminder");
              setReminders([]);
            } catch {
              /* ignore error */
            }
            setLoading(false);
          }}
        >
          Hapus Semua
        </button>
      </div>
      {loading && <div className="text-center py-4">Memuat data...</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Waktu</th>
              <th className="border px-2 py-1">User</th>
              <th className="border px-2 py-1">Modul</th>
              <th className="border px-2 py-1">Data ID</th>
              <th className="border px-2 py-1">Pesan</th>
              <th className="border px-2 py-1">Jatuh Tempo</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">
                  Tidak ada reminder.
                </td>
              </tr>
            ) : (
              reminders.map((rem, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1 whitespace-nowrap">
                    {rem.created}
                  </td>
                  <td className="border px-2 py-1">{rem.user}</td>
                  <td className="border px-2 py-1">{rem.modulId}</td>
                  <td className="border px-2 py-1">{rem.dataId}</td>
                  <td className="border px-2 py-1">{rem.pesan}</td>
                  <td className="border px-2 py-1">{rem.dueDate}</td>
                  <td className="border px-2 py-1">{rem.status}</td>
                  <td className="border px-2 py-1">
                    {rem.status !== "done" && (
                      <button
                        className="bg-green-100 text-green-700 px-2 py-1 rounded"
                        onClick={async () => await handleComplete(i, rem)}
                      >
                        Selesai
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
