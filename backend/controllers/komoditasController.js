// Komoditas Controller (Master Data)
import Komoditas from "../models/komoditas.js";

// List all komoditas
export const listKomoditas = async (req, res) => {
  try {
    const komoditas = await Komoditas.findAll({
      attributes: ["id", "nama"],
      order: [["nama", "ASC"]],
    });
    res.json(komoditas);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data komoditas", details: err.message });
  }
};

// Search komoditas by nama
export const searchKomoditas = async (req, res) => {
  const { q } = req.query;
  try {
    const komoditas = await Komoditas.findAll({
      where: {
        nama: { [Komoditas.sequelize.Op.like]: `%${q}%` },
      },
      attributes: ["id", "nama"],
      order: [["nama", "ASC"]],
    });
    res.json(komoditas);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mencari komoditas", details: err.message });
  }
};

// Get komoditas by ID
export const getKomoditasById = async (req, res) => {
  const { id } = req.params;
  try {
    const komoditas = await Komoditas.findByPk(id, {
      attributes: ["id", "nama"],
    });
    if (!komoditas)
      return res.status(404).json({ error: "Komoditas tidak ditemukan" });
    res.json(komoditas);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data komoditas", details: err.message });
  }
};
