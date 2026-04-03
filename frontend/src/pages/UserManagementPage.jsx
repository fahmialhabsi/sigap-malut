import React, { useState, useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { roleNameToId } from "../utils/roleMap";
import unitNameToId from "../utils/unitMap";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Navigate } from "react-router-dom";
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
} from "../utils/notify";
import { sanitize } from "../utils/sanitize";
import ConfirmModal from "../components/ui/ConfirmModal";
import { normalizeRoleKey } from "../utils/normalizeRole";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const asUuid = (value) => {
  const normalized = String(value || "").trim();
  return UUID_REGEX.test(normalized) ? normalized : null;
};

/** Normalisasi nilai role dari form (string), selaras dengan normalizeRoleKey */
const normalizeRoleString = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

export default function UserManagementPage() {
  // Hooks harus dipanggil sebelum conditional return
  const user = useAuthStore((state) => state.user);
  const [userList, setUserList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nama_lengkap: "",
    role: "pelaksana",
    unit_kerja: "",
    nip: "",
    jabatan: "",
  });
  const [auditRows, setAuditRows] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState("365");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [archivedRows, setArchivedRows] = useState([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  useEffect(() => {
    // Fetch user list from backend
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUserList(data.data);
        } else {
          setUserList([]);
        }
      } catch {
        setUserList([]);
      }
    };
    fetchUsers();
  }, []);

  const fetchAuditLog = async () => {
    setAuditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/users/audit-log?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAuditRows(data.success ? data.data || [] : []);
    } catch {
      setAuditRows([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchArchivedAuditLog = async () => {
    setArchivedLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/users/audit-log/archive?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setArchivedRows(data.success ? data.data || [] : []);
    } catch {
      setArchivedRows([]);
    } finally {
      setArchivedLoading(false);
    }
  };

  const refreshAuditPanels = () => {
    fetchAuditLog();
    fetchArchivedAuditLog();
  };

  useEffect(() => {
    if (!user || normalizeRoleKey(user) !== "super_admin") return;
    refreshAuditPanels();
  }, [user]);

  // useEffect untuk fetch user list tetap, tapi setForm dipindahkan ke handler

  // Setelah semua hooks, baru conditional return
  if (!user || normalizeRoleKey(user) !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  // ...existing code...
  const handleAdd = () => {
    setEditUser(null);
    setForm({
      username: "",
      email: "",
      password: "",
      nama_lengkap: "",
      role: "pelaksana",
      unit_kerja: "",
      nip: "",
      jabatan: "",
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm(user);
    setShowModal(true);
  };

  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Username", accessor: "username" },
    { Header: "Email", accessor: "email" },
    { Header: "Nama Lengkap", accessor: "nama_lengkap" },
    { Header: "Role", accessor: "role" },
    { Header: "Unit Kerja", accessor: "unit_kerja" },
    { Header: "NIP", accessor: "nip" },
    { Header: "Jabatan", accessor: "jabatan" },
    { Header: "Aksi", accessor: "aksi" },
  ];

  const handleDelete = (id) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = async () => {
    const id = deleteTargetId;
    setDeleteLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const resUsers = await fetch("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await resUsers.json();
        setUserList(usersData.data || []);
        refreshAuditPanels();
        notifySuccess("User berhasil dihapus");
      } else {
        notifyError(data.message || "Gagal menghapus user");
      }
    } catch {
      notifyError("Terjadi error saat menghapus user");
    } finally {
      setDeleteLoading(false);
      setDeleteTargetId(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Sanitasi input kecuali password
    const safeValue = name === "password" ? value : sanitize(value);
    setForm((prev) => ({ ...prev, [name]: safeValue }));
  };

  // Handler submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      // Fallback for unit_kerja (ensure select value read correctly)
      const domUnitSelect =
        typeof document !== "undefined" &&
        document.querySelector('select[name="unit_kerja"]');
      const derivedUnit =
        form.unit_kerja || (domUnitSelect && domUnitSelect.value) || null;

      // Basic client-side validation
      if (!derivedUnit) {
        notifyWarning("Silakan pilih Unit Kerja");
        return;
      }
      if (!editUser && !form.password) {
        notifyWarning("Password wajib diisi untuk user baru");
        return;
      }
      let res;
      const normalizedRole = normalizeRoleString(form.role);
      const mappedRoleId = asUuid(roleNameToId[normalizedRole]);
      const mappedUnitId =
        asUuid(unitNameToId[derivedUnit]) || asUuid(derivedUnit);

      // Ensure backend-required role_id and unit_id are provided.
      const payload = {
        ...form,
        name: form.nama_lengkap || form.name || form.username,
        // Always send canonical role key; send role_id only when it's a UUID.
        role: normalizedRole,
        role_id: mappedRoleId,
        unit_kerja: derivedUnit,
        unit_id: mappedUnitId,
      };

      if (editUser) {
        // Update user
        res = await fetch(`/api/auth/users/${editUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create user
        res = await fetch(`/api/auth/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        const resUsers = await fetch("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await resUsers.json();
        const users = usersData.data || [];
        setUserList(users);
        refreshAuditPanels();
        if (data.meta?.role_auto_created?.code) {
          notifyInfo(
            `Role baru otomatis dibuat di database: ${data.meta.role_auto_created.code} (${data.meta.role_auto_created.name || ""}). Tim IT dapat melihat jejak di bawah.`,
          );
        }
        notifySuccess(
          editUser ? "User berhasil diperbarui" : "User berhasil ditambahkan",
        );
      } else {
        notifyError(data.message || "Gagal menyimpan user");
      }
    } catch {
      notifyError("Terjadi error saat menyimpan user");
    }
  };

  const handleExportAuditCsv = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/users/audit-log/export?limit=8000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok || !ct.includes("csv")) {
        const err = await res.json().catch(() => ({}));
        notifyError(err.message || "Gagal mengunduh CSV");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-management-audit-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      notifySuccess("CSV berhasil diunduh");
    } catch {
      notifyError("Gagal mengunduh CSV");
    } finally {
      setExportLoading(false);
    }
  };

  const handleArchiveRetentionConfirm = async () => {
    const days = Math.max(30, Math.min(3650, parseInt(retentionDays, 10) || 365));
    setArchiveLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/users/audit-log/archive-retention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ olderThanDays: days }),
      });
      const data = await res.json();
      if (data.success) {
        setArchiveModalOpen(false);
        refreshAuditPanels();
        notifySuccess(
          data.message ||
            `Arsip: ${data.data?.moved ?? 0} baris dipindahkan ke audit_log_archive`,
        );
      } else {
        notifyError(data.message || "Gagal mengarsipkan");
      }
    } catch {
      notifyError("Gagal mengarsipkan jejak");
    } finally {
      setArchiveLoading(false);
    }
  };

  // Render modal form (profesional, dark mode aware)
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 pt-12 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Tutup form"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="font-bold text-xl mb-4 text-blue-900 dark:text-blue-200 text-center pr-8">
          {editUser ? "Edit User" : "Tambah User"}
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Password
                {editUser && (
                  <span className="text-xs text-slate-400">
                    {" "}
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Nama Lengkap
              </label>
              <input
                name="nama_lengkap"
                value={form.nama_lengkap}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="super_admin">Super Admin</option>
                <option value="kepala_dinas">Kepala Dinas</option>
                <option value="sekretaris">Sekretaris</option>
                <option value="kepala_bidang">Kepala Bidang</option>
                <option value="kepala_uptd">Kepala UPTD</option>
                <option value="kasubbag">Kasubbag</option>
                <option value="kasubbag_umum">Kasubbag Umum</option>
                <option value="kasubbag_kepegawaian">
                  Kasubbag Kepegawaian
                </option>
                <option value="kasubbag_perencanaan">
                  Kasubbag Perencanaan
                </option>
                <option value="kasi_uptd">Kasi UPTD</option>
                <option value="kasubbag_tu_uptd">Kasubbag TU UPTD</option>
                <option value="kasi_mutu_uptd">Kasi Mutu UPTD</option>
                <option value="kasi_teknis_uptd">Kasi Teknis UPTD</option>
                <option value="fungsional">Fungsional</option>
                <option value="fungsional_perencana">
                  Fungsional Perencana
                </option>
                <option value="fungsional_analis">Fungsional Analis</option>
                <option value="fungsional_keuangan">Fungsional Keuangan</option>
                <option value="fungsional_ketersediaan">
                  Fungsional Ketersediaan (JF Bidang)
                </option>
                <option value="fungsional_distribusi">
                  Fungsional Distribusi (JF Bidang)
                </option>
                <option value="fungsional_konsumsi">
                  Fungsional Konsumsi (JF Bidang)
                </option>
                <option value="pelaksana">Pelaksana</option>
                <option value="pelaksana_ketersediaan">
                  Pelaksana Ketersediaan
                </option>
                <option value="pelaksana_distribusi">
                  Pelaksana Distribusi
                </option>
                <option value="pelaksana_konsumsi">Pelaksana Konsumsi</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Unit Kerja
              </label>
              <select
                name="unit_kerja"
                value={form.unit_kerja}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Sekretariat">Sekretariat</option>
                <option value="UPTD">UPTD</option>
                <option value="Bidang Ketersediaan">Bidang Ketersediaan</option>
                <option value="Bidang Distribusi">Bidang Distribusi</option>
                <option value="Bidang Konsumsi">Bidang Konsumsi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                NIP
              </label>
              <input
                name="nip"
                value={form.nip}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                Jabatan
              </label>
              <input
                name="jabatan"
                value={form.jabatan}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            <button
              type="button"
              className="bg-gray-200 dark:bg-slate-700 dark:text-slate-100 px-4 py-2 rounded font-semibold"
              onClick={() => setShowModal(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const formatAuditTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "medium",
      });
    } catch {
      return String(iso);
    }
  };

  const aksiBadgeClass = (aksi) => {
    switch (aksi) {
      case "CREATE":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
      case "UPDATE":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100";
      case "DELETE":
        return "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100";
      case "ROLE_AUTO_CREATED":
        return "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100";
    }
  };

  const dataWithActions = userList.map((u) => ({
    ...u,
    aksi: (
      <React.Fragment>
        <div className="flex gap-2 justify-center">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition"
            title="Edit User"
            onClick={() => handleEdit(u)}
          >
            <PencilSquareIcon className="w-4 h-4" /> Edit
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition"
            title="Hapus User"
            onClick={() => handleDelete(u.id)}
          >
            <TrashIcon className="w-4 h-4" /> Hapus
          </button>
        </div>
      </React.Fragment>
    ),
  }));

  return (
    <div className="min-h-[70vh] w-full max-w-[1800px] mx-auto flex flex-col px-2 md:px-4 py-6">
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 md:p-6 relative">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-blue-200 mb-6 text-center tracking-tight pr-40">
          Manajemen User
        </h1>
        <button
          className="absolute right-4 md:right-6 top-4 md:top-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-sm"
          onClick={handleAdd}
        >
          <PlusIcon className="w-4 h-4" /> Tambah User
        </button>
        <div className="overflow-x-auto mt-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-[1200px] w-full text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className={`p-3 text-left font-bold text-xs text-slate-700 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 whitespace-nowrap ${
                      col.accessor === "aksi"
                        ? "sticky right-0 z-[2] bg-gray-50 dark:bg-slate-800 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.12)]"
                        : ""
                    }`}
                  >
                    {col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataWithActions.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-slate-400 dark:text-slate-300 bg-white dark:bg-slate-900"
                  >
                    Data kosong
                  </td>
                </tr>
              ) : (
                dataWithActions.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      "transition hover:bg-blue-50 dark:hover:bg-slate-800 " +
                      (idx % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-slate-50 dark:bg-slate-800")
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.accessor}
                        className={`p-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 align-middle ${
                          col.accessor === "aksi"
                            ? "sticky right-0 z-[1] bg-inherit shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)] dark:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.4)]"
                            : ""
                        }`}
                      >
                        {row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Jejak digital — aktif (
              <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                audit_log
              </code>
              )
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => refreshAuditPanels()}
                disabled={auditLoading || archivedLoading}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                {auditLoading || archivedLoading
                  ? "Memuat…"
                  : "Muat ulang jejak"}
              </button>
              <button
                type="button"
                onClick={handleExportAuditCsv}
                disabled={exportLoading}
                className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {exportLoading ? "Mengunduh…" : "Ekspor CSV"}
              </button>
              <div className="flex items-center gap-1 flex-wrap">
                <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Retensi (hari):
                </label>
                <input
                  type="number"
                  min={30}
                  max={3650}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setArchiveModalOpen(true)}
                  className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                  Arsip jejak lama
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Riwayat tindakan Super Admin: tambah / ubah / hapus user, dan
            pembuatan role baru otomatis di tabel{" "}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
              roles
            </code>{" "}
            bila kode role belum ada (aksi{" "}
            <span className="font-semibold">ROLE_AUTO_CREATED</span>
            ). Email ke tim IT (jika SMTP +{" "}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
              IT_AUDIT_NOTIFY_EMAILS
            </code>{" "}
            diset) mengikuti{" "}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
              IT_AUDIT_NOTIFY_EVENTS
            </code>
            . Retensi memindahkan entri lama ke{" "}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
              audit_log_archive
            </code>
            .
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-[420px] overflow-y-auto">
            <table className="min-w-[900px] w-full text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Waktu
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Aksi
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    ID entitas
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Pelaku
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-slate-400 dark:text-slate-500"
                    >
                      {auditLoading
                        ? "Memuat jejak…"
                        : "Belum ada entri audit."}
                    </td>
                  </tr>
                ) : (
                  auditRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    >
                      <td className="p-2 text-slate-700 dark:text-slate-300 whitespace-nowrap align-top">
                        {formatAuditTime(row.created_at)}
                      </td>
                      <td className="p-2 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-semibold ${aksiBadgeClass(row.aksi)}`}
                        >
                          {row.aksi}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 align-top font-mono max-w-[200px] break-all">
                        {row.entitas_id ?? "—"}
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300 align-top">
                        <div className="font-medium">
                          {row.pelaku_username || "—"}
                        </div>
                        <div className="text-slate-500 dark:text-slate-500">
                          {row.pelaku_nama || ""}
                        </div>
                      </td>
                      <td className="p-2 align-top">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 dark:text-blue-400 font-medium">
                            Lihat snapshot
                          </summary>
                          <pre className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-950 text-[10px] overflow-x-auto max-h-40 overflow-y-auto text-left">
                            {JSON.stringify(
                              {
                                data_lama: row.data_lama,
                                data_baru: row.data_baru,
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Jejak diarsipkan (
                <code className="text-sm font-mono bg-amber-50 dark:bg-amber-900/30 px-1 rounded">
                  audit_log_archive
                </code>
                )
              </h3>
              <button
                type="button"
                onClick={() => fetchArchivedAuditLog()}
                disabled={archivedLoading}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 self-start"
              >
                {archivedLoading ? "Memuat arsip…" : "Muat ulang arsip"}
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Data yang sudah dipindahkan oleh retensi; kolom &quot;Waktu
              kejadian&quot; mengacu pada waktu asli di audit (sebelum arsip).
            </p>
            <div className="overflow-x-auto rounded-xl border border-amber-200 dark:border-amber-900/50 max-h-[360px] overflow-y-auto">
              <table className="min-w-[1000px] w-full text-xs border-collapse">
                <thead className="bg-amber-50 dark:bg-amber-950/40 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      Waktu kejadian
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      Diarsipkan
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      Aksi
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      ID entitas
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      ID audit asli
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      Pelaku
                    </th>
                    <th className="p-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-amber-200 dark:border-amber-900/50">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {archivedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-6 text-center text-slate-400 dark:text-slate-500"
                      >
                        {archivedLoading
                          ? "Memuat arsip…"
                          : "Belum ada jejak diarsipkan."}
                      </td>
                    </tr>
                  ) : (
                    archivedRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-amber-100/80 dark:border-amber-900/30 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800/80"
                      >
                        <td className="p-2 text-slate-700 dark:text-slate-300 whitespace-nowrap align-top">
                          {formatAuditTime(row.source_created_at)}
                        </td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 whitespace-nowrap align-top text-[11px]">
                          {formatAuditTime(row.archived_at)}
                        </td>
                        <td className="p-2 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-semibold ${aksiBadgeClass(row.aksi)}`}
                          >
                            {row.aksi}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 align-top font-mono max-w-[160px] break-all">
                          {row.entitas_id ?? "—"}
                        </td>
                        <td className="p-2 text-slate-500 dark:text-slate-500 align-top font-mono text-[11px]">
                          {row.original_audit_log_id ?? "—"}
                        </td>
                        <td className="p-2 text-slate-700 dark:text-slate-300 align-top">
                          <div className="font-medium">
                            {row.pelaku_username || "—"}
                          </div>
                          <div className="text-slate-500 dark:text-slate-500">
                            {row.pelaku_nama || ""}
                          </div>
                        </td>
                        <td className="p-2 align-top">
                          <details className="cursor-pointer">
                            <summary className="text-amber-700 dark:text-amber-400 font-medium">
                              Lihat snapshot
                            </summary>
                            <pre className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-950 text-[10px] overflow-x-auto max-h-40 overflow-y-auto text-left">
                              {JSON.stringify(
                                {
                                  data_lama: row.data_lama,
                                  data_baru: row.data_baru,
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {showModal && renderModal()}
        <ConfirmModal
          isOpen={deleteTargetId !== null}
          title="Hapus User"
          message="Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
        <ConfirmModal
          isOpen={archiveModalOpen}
          title="Arsip retensi jejak audit"
          message={`Entri Manajemen User di tabel audit_log yang lebih tua dari ${Math.max(30, Math.min(3650, parseInt(retentionDays, 10) || 365))} hari akan dipindahkan ke audit_log_archive dan dihapus dari tampilan aktif. Lanjutkan?`}
          confirmLabel="Arsipkan"
          confirmClass="bg-amber-600 hover:bg-amber-700 focus:ring-amber-400"
          loading={archiveLoading}
          onConfirm={handleArchiveRetentionConfirm}
          onCancel={() => !archiveLoading && setArchiveModalOpen(false)}
        />
      </div>
    </div>
  );
}
