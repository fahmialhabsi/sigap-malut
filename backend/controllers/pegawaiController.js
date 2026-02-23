// Pegawai Controller (Master Data)
import User from "../models/User.js";

// List all pegawai
export const listPegawai = async (req, res) => {
  try {
    const pegawai = await User.findAll({
      where: { is_active: true },
      attributes: [
        "id",
        "nama_lengkap",
        "nip",
        "jabatan",
        "unit_kerja",
        "role",
        "email",
        "telepon",
        "foto",
      ],
      order: [["nama_lengkap", "ASC"]],
    });
    res.json(pegawai);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data pegawai", details: err.message });
  }
};

// Search pegawai by nama_lengkap or nip
export const searchPegawai = async (req, res) => {
  const { q } = req.query;
  try {
    const pegawai = await User.findAll({
      where: {
        is_active: true,
        [User.sequelize.Op.or]: [
          { nama_lengkap: { [User.sequelize.Op.like]: `%${q}%` } },
          { nip: { [User.sequelize.Op.like]: `%${q}%` } },
        ],
      },
      attributes: [
        "id",
        "nama_lengkap",
        "nip",
        "jabatan",
        "unit_kerja",
        "role",
        "email",
        "telepon",
        "foto",
      ],
      order: [["nama_lengkap", "ASC"]],
    });
    res.json(pegawai);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mencari pegawai", details: err.message });
  }
};

// Get pegawai by ID
export const getPegawaiById = async (req, res) => {
  const { id } = req.params;
  try {
    const pegawai = await User.findByPk(id, {
      attributes: [
        "id",
        "nama_lengkap",
        "nip",
        "jabatan",
        "unit_kerja",
        "role",
        "email",
        "telepon",
        "foto",
      ],
    });
    if (!pegawai)
      return res.status(404).json({ error: "Pegawai tidak ditemukan" });
    res.json(pegawai);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data pegawai", details: err.message });
  }
};
