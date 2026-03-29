// backend/controllers/sekretaris/konsolidasiController.js
// Konsolidasi laporan dari 3 Bidang + UPTD untuk diteruskan ke Kepala Dinas

import { Op } from "sequelize";
import LaporanKonsolidasiSekretaris from "../../models/LaporanKonsolidasiSekretaris.js";

// GET /api/sekretaris/konsolidasi?bulan=3&tahun=2026&jenis=bulanan
export const getKonsolidasi = async (req, res) => {
  try {
    const now = new Date();
    const bulan = Number(req.query.bulan) || (now.getMonth() + 1);
    const tahun = Number(req.query.tahun) || now.getFullYear();
    const jenis = req.query.jenis || "bulanan";

    let konsolidasi = await LaporanKonsolidasiSekretaris.findOne({
      where: { periode_bulan: bulan, periode_tahun: tahun, jenis_laporan: jenis },
      raw: true,
    }).catch(() => null);

    // Jika belum ada, buat record kosong (tidak simpan ke DB)
    if (!konsolidasi) {
      konsolidasi = {
        id: null, periode_bulan: bulan, periode_tahun: tahun, jenis_laporan: jenis,
        ketersediaan_submitted: false, ketersediaan_submitted_at: null,
        distribusi_submitted: false, distribusi_submitted_at: null,
        konsumsi_submitted: false, konsumsi_submitted_at: null,
        uptd_submitted: false, uptd_submitted_at: null,
        status: "menunggu_semua_unit",
        dikerjakan_oleh: null, ringkasan_url: null, diteruskan_at: null,
      };
    }

    // Cek apakah semua unit sudah submit
    const allSubmitted = konsolidasi.ketersediaan_submitted &&
      konsolidasi.distribusi_submitted &&
      konsolidasi.konsumsi_submitted &&
      konsolidasi.uptd_submitted;

    res.json({
      success: true,
      data: { ...konsolidasi, all_submitted: allSubmitted },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/konsolidasi/riwayat
export const getRiwayatKonsolidasi = async (req, res) => {
  try {
    const list = await LaporanKonsolidasiSekretaris.findAll({
      order: [["periode_tahun", "DESC"], ["periode_bulan", "DESC"]],
      limit: 24,
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/konsolidasi/unit-submit
// Dipanggil oleh Kepala Bidang/UPTD saat submit laporan
// body: { unit: "ketersediaan"|"distribusi"|"konsumsi"|"uptd", bulan, tahun, jenis }
export const unitSubmit = async (req, res) => {
  const { unit, bulan, tahun, jenis = "bulanan" } = req.body || {};
  const validUnits = ["ketersediaan", "distribusi", "konsumsi", "uptd"];
  if (!validUnits.includes(unit)) {
    return res.status(400).json({ success: false, message: "unit tidak valid." });
  }

  const b = Number(bulan) || (new Date().getMonth() + 1);
  const y = Number(tahun) || new Date().getFullYear();

  try {
    const [record] = await LaporanKonsolidasiSekretaris.findOrCreate({
      where: { periode_bulan: b, periode_tahun: y, jenis_laporan: jenis },
      defaults: { periode_bulan: b, periode_tahun: y, jenis_laporan: jenis },
    });

    await record.update({
      [`${unit}_submitted`]: true,
      [`${unit}_submitted_at`]: new Date(),
    });

    // Auto-update status
    await record.reload();
    if (record.ketersediaan_submitted && record.distribusi_submitted &&
        record.konsumsi_submitted && record.uptd_submitted) {
      await record.update({ status: "siap_dikonsolidasi" });
    }

    res.json({ success: true, message: `Laporan ${unit} berhasil disubmit.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/konsolidasi/generate
export const generateKonsolidasi = async (req, res) => {
  const { bulan, tahun, jenis = "bulanan" } = req.body || {};
  const b = Number(bulan) || (new Date().getMonth() + 1);
  const y = Number(tahun) || new Date().getFullYear();
  const sekretarisId = req.user?.id;

  try {
    const record = await LaporanKonsolidasiSekretaris.findOne({
      where: { periode_bulan: b, periode_tahun: y, jenis_laporan: jenis },
    });

    if (!record) return res.status(404).json({ success: false, message: "Data konsolidasi tidak ditemukan." });

    if (!record.ketersediaan_submitted || !record.distribusi_submitted ||
        !record.konsumsi_submitted || !record.uptd_submitted) {
      return res.status(400).json({
        success: false,
        message: "Belum semua unit submit laporan. Konsolidasi tidak dapat dilakukan.",
        missing: {
          ketersediaan: !record.ketersediaan_submitted,
          distribusi: !record.distribusi_submitted,
          konsumsi: !record.konsumsi_submitted,
          uptd: !record.uptd_submitted,
        },
      });
    }

    await record.update({
      status: "sedang_dikonsolidasi",
      dikerjakan_oleh: sekretarisId,
    });

    // Dalam implementasi nyata: trigger laporanGeneratorService untuk generate PDF
    // Untuk sekarang: simulasi selesai
    setTimeout(async () => {
      await record.update({ status: "selesai_konsolidasi" }).catch(() => {});
    }, 2000);

    res.json({ success: true, message: "Proses konsolidasi dimulai." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/konsolidasi/:id/teruskan-kadin
export const teruskankKadinKonsolidasi = async (req, res) => {
  try {
    const record = await LaporanKonsolidasiSekretaris.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Konsolidasi tidak ditemukan." });

    if (!["selesai_konsolidasi", "siap_dikonsolidasi"].includes(record.status)) {
      return res.status(400).json({ success: false, message: "Konsolidasi belum selesai." });
    }

    await record.update({ status: "diteruskan_ke_kadin", diteruskan_at: new Date() });
    res.json({ success: true, message: "Laporan konsolidasi diteruskan ke Kepala Dinas." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
