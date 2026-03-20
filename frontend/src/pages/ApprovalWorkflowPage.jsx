import React, { useEffect, useState } from "react";
import RoleSwitch from "../components/ui/RoleSwitch";
import { APPROVAL_STATUS } from "../utils/approvalWorkflow";
import {
  getApprovalWorkflowAPI,
  submitForApprovalAPI,
  updateApprovalStatusAPI,
} from "../services/approvalService";
import api from "../services/apiClient";

const ApprovalWorkflowPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [notif, setNotif] = useState("");
  const [currentRole, setCurrentRole] = useState("admin");
  const [form, setForm] = useState({ modulId: "", dataId: "", detail: "" });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getApprovalWorkflowAPI();
      setLogs((res.data || []).slice().reverse());
    } catch {
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Approval Workflow</h2>
        <RoleSwitch
          roles={["admin", "verifikator", "approver", "user"]}
          currentRole={currentRole}
          onSwitch={setCurrentRole}
        />
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/approval");
              setLogs([]);
              setNotif("Log approval dihapus.");
            } catch {
              setNotif("Gagal hapus log.");
            }
            setLoading(false);
          }}
        >
          Hapus Log
        </button>
      </div>
      {notif && (
        <div className="mb-4 text-sm text-green-700 bg-green-100 rounded px-3 py-2">
          {notif}
        </div>
      )}
      <div className="mb-6 border p-4 rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Ajukan Approval</h3>
        <form
          className="flex gap-2 flex-wrap items-center"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await submitForApprovalAPI({
                user: { username: currentRole },
                modulId: form.modulId,
                dataId: form.dataId,
                detail: form.detail,
              });
              setNotif("Approval berhasil diajukan.");
              setForm({ modulId: "", dataId: "", detail: "" });
              await fetchLogs();
            } catch {
              setNotif("Gagal ajukan approval.");
            }
            setLoading(false);
          }}
        >
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Modul"
            value={form.modulId}
            onChange={(e) => setForm({ ...form, modulId: e.target.value })}
            required
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Data ID"
            value={form.dataId}
            onChange={(e) => setForm({ ...form, dataId: e.target.value })}
            required
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Detail"
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            required
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow"
            type="submit"
            disabled={loading}
          >
            Ajukan
          </button>
        </form>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <span className="text-sm">Filter status:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua</option>
          {APPROVAL_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Memuat data approval...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Waktu</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Modul</th>
                <th className="border px-2 py-1">Data ID</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Detail</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.filter(
                (log) => !statusFilter || log.status === statusFilter,
              ).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Tidak ada log approval.
                  </td>
                </tr>
              ) : (
                logs
                  .filter((log) => !statusFilter || log.status === statusFilter)
                  .map((log, i) => {
                    // Role-based actions
                    let actions = [];
                    if (
                      currentRole === "verifikator" &&
                      log.status === "diajukan"
                    ) {
                      actions.push({
                        label: "Verifikasi",
                        status: "diverifikasi",
                      });
                    }
                    if (
                      currentRole === "approver" &&
                      log.status === "diverifikasi"
                    ) {
                      actions.push({ label: "Setujui", status: "disetujui" });
                      actions.push({ label: "Tolak", status: "ditolak" });
                      actions.push({ label: "Revisi", status: "revisi" });
                    }
                    return (
                      <tr key={i}>
                        <td className="border px-2 py-1 whitespace-nowrap">
                          {log.time}
                        </td>
                        <td className="border px-2 py-1">{log.user}</td>
                        <td className="border px-2 py-1">{log.modulId}</td>
                        <td className="border px-2 py-1">{log.dataId}</td>
                        <td className="border px-2 py-1">{log.status}</td>
                        <td className="border px-2 py-1">{log.detail}</td>
                        <td className="border px-2 py-1">
                          {actions.length > 0 && (
                            <div className="flex gap-2">
                              {actions.map((a) => (
                                <button
                                  key={a.status}
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                                  onClick={async () => {
                                    setLoading(true);
                                    try {
                                      await updateApprovalStatusAPI({
                                        user: { username: currentRole },
                                        modulId: log.modulId,
                                        dataId: log.dataId,
                                        status: a.status,
                                        detail: a.label,
                                      });
                                      setNotif(`Status ${a.label} berhasil.`);
                                      await fetchLogs();
                                    } catch {
                                      setNotif(
                                        `Gagal update status ${a.label}.`,
                                      );
                                    }
                                    setLoading(false);
                                  }}
                                  disabled={loading}
                                >
                                  {a.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApprovalWorkflowPage;
