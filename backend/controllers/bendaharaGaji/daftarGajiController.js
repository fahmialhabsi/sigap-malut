import { Op } from "sequelize";
import DaftarGaji from "../../models/DaftarGaji.js";
import Spj from "../../models/Spj.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nomorDaftarGaji(tahun, bulan) {
  return `DG-${tahun}-${pad2(bulan)}`;
}

export async function listDaftarGaji(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "24", 10), 100);
    const rows = await DaftarGaji.findAll({
      where: { dibuat_oleh: userId },
      order: [
        ["periode_tahun", "DESC"],
        ["periode_bulan", "DESC"],
      ],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar gaji",
      error: err.message,
    });
  }
}

export async function getBulanIni(req, res) {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const row = await DaftarGaji.findOne({
      where: { periode_bulan: bulan, periode_tahun: tahun, dibuat_oleh: userId },
      order: [["updated_at", "DESC"]],
    });
    return res.json({ success: true, data: row || null });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar gaji bulan ini",
      error: err.message,
    });
  }
}

export async function buatBulanIni(req, res) {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const nomor = nomorDaftarGaji(tahun, bulan);

    const [row] = await DaftarGaji.findOrCreate({
      where: { periode_bulan: bulan, periode_tahun: tahun, dibuat_oleh: userId },
      defaults: {
        nomor_daftar_gaji: nomor,
        jumlah_asn: 0,
        total_gaji_kotor: 0,
        total_potongan: 0,
        total_gaji_bersih: 0,
        status: "draft",
        revisi_ke: 0,
      },
    });

    return res.json({
      success: true,
      message: "Daftar gaji bulan ini siap",
      data: row,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat daftar gaji",
      error: err.message,
    });
  }
}

export async function updateDraft(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await DaftarGaji.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Daftar gaji tidak ditemukan" });
    }
    if (row.status !== "draft") {
      return res.status(400).json({ success: false, message: "Hanya draft yang bisa diubah" });
    }

    const patch = req.body || {};
    for (const k of [
      "jumlah_asn",
      "total_gaji_kotor",
      "total_potongan",
      "total_gaji_bersih",
      "pagu_dpa_belanja_pegawai",
      "sisa_pagu",
    ]) {
      if (patch[k] != null) row[k] = patch[k];
    }
    await row.save();
    return res.json({ success: true, message: "Draft diperbarui", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update draft", error: err.message });
  }
}

export async function submitKePpk(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await DaftarGaji.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Daftar gaji tidak ditemukan" });
    }
    if (!["draft", "siap_dianalisa", "dikembalikan_jf_keuangan"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "Status tidak bisa disubmit ke PPK" });
    }

    row.status = "diajukan_ke_jf_keuangan";
    await row.save();

    // Bridge ke PPK Queue (existing) via Spj record (MVP document carrier)
    await Spj.create({
      nomor_spj: `SPJ-GAJI-${row.nomor_daftar_gaji || `${row.periode_tahun}-${pad2(row.periode_bulan)}`}`,
      jenis_belanja: "belanja_pegawai",
      sub_kegiatan_kode: "GAJI-BULANAN",
      kode_rekening: "5.1.02.01.01",
      nominal: row.total_gaji_bersih || 0,
      keterangan: `Daftar gaji ${row.periode_bulan}/${row.periode_tahun} (${row.nomor_daftar_gaji || "-"})`,
      dibuat_oleh: userId,
      tanggal_kegiatan: new Date(),
      lampiran_url: null,
      status: "diajukan_ke_ppk",
      jenis_bendahara: "gaji",
      bendahara_pengirim_id: userId,
      diverifikasi_bendahara_oleh: userId,
      diverifikasi_bendahara_at: new Date(),
      catatan_bendahara: "Pengajuan daftar gaji (MVP)",
    }).catch(() => null);

    return res.json({ success: true, message: "Disubmit ke JF Keuangan/PPK", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit ke PPK", error: err.message });
  }
}

export async function listDikembalikan(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await DaftarGaji.findAll({
      where: {
        dibuat_oleh: userId,
        status: {
          [Op.in]: [
            "dikembalikan_jf_keuangan",
            "dikembalikan_kasubag",
            "dikembalikan_sekretaris",
          ],
        },
      },
      order: [["updated_at", "DESC"]],
      limit,
    });

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil dikembalikan", error: err.message });
  }
}

