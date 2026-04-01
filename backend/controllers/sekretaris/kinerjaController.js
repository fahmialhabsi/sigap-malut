import { Op, fn, col } from "sequelize";
import SkpPenilaianSekretaris from "../../models/SkpPenilaianSekretaris.js";
import User from "../../models/User.js";

function currentPeriode() {
  const now = new Date();
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
}

export const getKinerjaBawahanAvg = async (req, res) => {
  try {
    const { bulan, tahun } = currentPeriode();
    const row = await SkpPenilaianSekretaris.findOne({
      attributes: [[fn("AVG", col("skor_total")), "avg_score"]],
      where: {
        periode_bulan: bulan,
        periode_tahun: tahun,
        status: { [Op.in]: ["draft", "final"] },
      },
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        periode_bulan: bulan,
        periode_tahun: tahun,
        avg_score:
          row?.avg_score != null ? Number.parseFloat(row.avg_score) : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil rata-rata kinerja bawahan",
      error: error.message,
    });
  }
};

export const listKinerjaBawahan = async (req, res) => {
  try {
    const { bulan, tahun } = currentPeriode();

    const rows = await SkpPenilaianSekretaris.findAll({
      where: { periode_bulan: bulan, periode_tahun: tahun },
      include: [
        { model: User, as: "yangDinilai", attributes: ["id", "nama_lengkap", "jabatan", "unit_kerja"] },
      ],
      order: [["skor_total", "DESC"]],
    });

    return res.json({
      success: true,
      data: rows,
      meta: { periode_bulan: bulan, periode_tahun: tahun },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kinerja bawahan",
      error: error.message,
    });
  }
};

