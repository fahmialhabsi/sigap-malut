import LaporanKonsolidasiSekretaris from "../../models/LaporanKonsolidasiSekretaris.js";

function defaultPeriode() {
  const now = new Date();
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear(), jenis: "bulanan" };
}

export const ensureKonsolidasiRow = async (req, res) => {
  try {
    const def = defaultPeriode();
    const periode_bulan = Number(req.body?.periode_bulan ?? def.bulan);
    const periode_tahun = Number(req.body?.periode_tahun ?? def.tahun);
    const jenis_laporan = String(req.body?.jenis_laporan ?? def.jenis);

    const [row] = await LaporanKonsolidasiSekretaris.findOrCreate({
      where: { periode_bulan, periode_tahun, jenis_laporan },
      defaults: { periode_bulan, periode_tahun, jenis_laporan },
    });

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyiapkan row konsolidasi",
      error: error.message,
    });
  }
};

export const getKonsolidasiStatus = async (req, res) => {
  try {
    const def = defaultPeriode();
    const periode_bulan = Number(req.query?.periode_bulan ?? def.bulan);
    const periode_tahun = Number(req.query?.periode_tahun ?? def.tahun);
    const jenis_laporan = String(req.query?.jenis_laporan ?? def.jenis);

    const row = await LaporanKonsolidasiSekretaris.findOne({
      where: { periode_bulan, periode_tahun, jenis_laporan },
    });

    return res.json({
      success: true,
      data: row,
      meta: { periode_bulan, periode_tahun, jenis_laporan },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil status konsolidasi",
      error: error.message,
    });
  }
};

