import React, { useState, useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { roleNameToId } from "../utils/roleMap";
import unitNameToId from "../utils/unitMap";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Navigate } from "react-router-dom";
import { notifySuccess, notifyError, notifyWarning } from "../utils/notify";
import { sanitize } from "../utils/sanitize";
import ConfirmModal from "../components/ui/ConfirmModal";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const asUuid = (value) => {
  const normalized = String(value || "").trim();
  return UUID_REGEX.test(normalized) ? normalized : null;
};

const normalizeRoleKey = (value) =>
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

  // useEffect untuk fetch user list tetap, tapi setForm dipindahkan ke handler

  // Setelah semua hooks, baru conditional return
  if (!user || user.role !== "super_admin") {
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
      const normalizedRole = normalizeRoleKey(form.role);
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

  // Render modal form (profesional, dark mode aware)
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="font-bold text-xl mb-4 text-blue-900 dark:text-blue-200 text-center">
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
                <option value="pelaksana">Pelaksana</option>
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 relative">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-blue-200 mb-6 text-center tracking-tight">
          Manajemen User
        </h1>
        <button
          className="absolute right-6 top-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-sm"
          onClick={handleAdd}
        >
          <PlusIcon className="w-4 h-4" /> Tambah User
        </button>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border rounded-xl text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className="p-3 text-left font-bold text-xs text-slate-700 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700"
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
                        className="p-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800"
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
      </div>
    </div>
  );
}
