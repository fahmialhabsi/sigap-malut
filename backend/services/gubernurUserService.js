import { Op } from "sequelize";
import User from "../models/User.js";
import Role from "../models/Role.js";

/**
 * Pengguna aktif dengan peran Kepala Dinas (sama kriteria dengan assignees Gubernur).
 */
export async function getKepalaDinasUsers() {
  const roleRow = await Role.findOne({
    where: {
      [Op.or]: [
        { code: "kepala_dinas" },
        { code: { [Op.iLike]: "kepala_dinas" } },
      ],
    },
  });

  const orUser = [
    { role: "kepala_dinas" },
    { role: { [Op.iLike]: "kepala_dinas" } },
  ];
  if (roleRow?.id) {
    orUser.push({ role_id: roleRow.id });
  }

  return User.findAll({
    where: { is_active: true, [Op.or]: orUser },
    attributes: [
      "id",
      "username",
      "nama_lengkap",
      "name",
      "email",
      "unit_kerja",
      "jabatan",
      "role",
      "role_id",
    ],
    order: [["nama_lengkap", "ASC"]],
  });
}

export async function getKepalaDinasUserIds() {
  const rows = await getKepalaDinasUsers();
  return rows.map((r) => Number(r.id));
}

/**
 * Satu ID default untuk penerima instruksi (urutan nama); null jika tidak ada.
 */
export async function getDefaultKepalaDinasUserId() {
  const rows = await getKepalaDinasUsers();
  return rows[0]?.id != null ? Number(rows[0].id) : null;
}

/**
 * ID pengguna aktif dengan peran Gubernur (untuk notifikasi in-app).
 */
export async function getGubernurUserIds() {
  const roleRow = await Role.findOne({
    where: {
      [Op.or]: [
        { code: "gubernur" },
        { code: { [Op.iLike]: "gubernur" } },
      ],
    },
  });

  const orUser = [
    { role: "gubernur" },
    { role: { [Op.iLike]: "gubernur" } },
  ];
  if (roleRow?.id) {
    orUser.push({ role_id: roleRow.id });
  }

  const rows = await User.findAll({
    where: { is_active: true, [Op.or]: orUser },
    attributes: ["id"],
  });
  return rows.map((r) => r.id);
}
