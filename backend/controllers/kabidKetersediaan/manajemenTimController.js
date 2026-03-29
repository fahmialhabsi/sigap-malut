// backend/controllers/kabidKetersediaan/manajemenTimController.js
// Manajemen tim JF 1 & JF 2 oleh Kepala Bidang Ketersediaan
// CATATAN: Kepala Bidang TIDAK bisa melihat Pelaksana di bawah JF (confidential)

import { Op } from "sequelize";
import User from "../../models/User.js";
import Perintah from "../../models/Perintah.js";
import AnalisaJfKetersediaan from "../../models/AnalisaJfKetersediaan.js";

const JF_ROLES = [
  "fungsional_ketersediaan",
  "jf_ketersediaan",
  "fungsional_perencana",
  "analis_pangan",
  "jabatan_fungsional",
];

function isJfRole(role) {
  const r = (role || "").toLowerCase();
  return JF_ROLES.some((jr) => r.includes(jr)) || r.includes("fungsional");
}

// GET /api/kabid-ketersediaan/tim
export const getTim = async (req, res) => {
  try {
    const now = new Date();

    // Ambil semua user dengan role JF di bidang ketersediaan
    const allUsers = await User.findAll({
      where: { deleted_at: null },
      attributes: ["id", "name", "username", "roleName", "role"],
      raw: true,
    }).catch(() => []);

    const jfList = allUsers.filter((u) => isJfRole(u.roleName || u.role));

    // Enrich dengan data tugas aktif per JF
    const enriched = await Promise.all(
      jfList.map(async (jf) => {
        const [tugasAktif, tugasSelesaiBulanIni, laporanDiajukan] = await Promise.all([
          Perintah.count({
            where: { ke_role: jf.roleName || jf.role, status: { [Op.notIn]: ["selesai", "ditolak"] } },
          }).catch(() => 0),
          Perintah.count({
            where: {
              ke_role: jf.roleName || jf.role,
              status: "selesai",
              updated_at: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) },
            },
          }).catch(() => 0),
          AnalisaJfKetersediaan.count({
            where: { jf_id: jf.id, status: "diajukan_kabid", deleted_at: null },
          }).catch(() => 0),
        ]);

        return {
          ...jf,
          tugas_aktif: tugasAktif,
          tugas_selesai_bulan_ini: tugasSelesaiBulanIni,
          laporan_menunggu_review: laporanDiajukan,
          // Pelaksana di bawah JF: TIDAK ditampilkan ke Kepala Bidang (confidential)
          pelaksana: "CONFIDENTIAL — tidak dapat diakses Kepala Bidang (PP 30/2019)",
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/kabid-ketersediaan/tugas — Assign tugas ke JF
export const assignTugasKeJf = async (req, res) => {
  const { ke_role, isi, prioritas = "normal", deadline, breakdown_dari } = req.body || {};
  if (!ke_role || !isi?.trim()) {
    return res.status(400).json({ success: false, message: "ke_role dan isi wajib diisi." });
  }

  try {
    const perintah = await Perintah.create({
      judul: isi.slice(0, 120),
      dari_role: "kepala_bidang_ketersediaan",
      dari_user_id: req.user?.id,
      ke_role,
      isi,
      prioritas: prioritas === "mendesak" ? "kritis" : prioritas,
      deadline: deadline || null,
      status: "terkirim",
      perintah_induk_id: breakdown_dari || null,
    });

    res.status(201).json({ success: true, data: perintah, message: "Tugas berhasil di-assign ke JF." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/kabid-ketersediaan/tugas — List tugas yang di-assign ke JF
export const getTugasKeJf = async (req, res) => {
  try {
    const { ke_role, status } = req.query;
    const where = { dari_role: "kepala_bidang_ketersediaan" };
    if (ke_role) where.ke_role = ke_role;
    if (status) where.status = status;

    const tugas = await Perintah.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: 100,
      raw: true,
    }).catch(() => []);

    const now = new Date();
    const enriched = tugas.map((t) => ({
      ...t,
      is_overdue: t.deadline && new Date(t.deadline) < now && !["selesai", "ditolak"].includes(t.status),
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
