import SuratMasuk from "../models/SuratMasuk.js";
import Disposisi from "../models/Disposisi.js";
import AgendaSurat from "../models/AgendaSurat.js";
import ArsipSurat from "../models/ArsipSurat.js";
import { processWithAI } from "../services/suratAIService.js";
import {
  generateNomorAgenda,
  generateArsipCode,
  KODE_KLASIFIKASI_ARSIP,
} from "../utils/suratUtils.js";

// POST /api/surat/masuk/upload
export const uploadSuratMasuk = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      media_terima = "Langsung",
      tanggal_surat,
      asal_surat,
      keterangan,
    } = req.body;

    const filePath = req.file ? req.file.path : null;

    // Generate nomor agenda
    const nomor_agenda = await generateNomorAgenda();

    // Buat record surat_masuk
    const surat = await SuratMasuk.create({
      nomor_agenda,
      tanggal_surat: tanggal_surat || new Date().toISOString().split("T")[0],
      tanggal_terima: new Date().toISOString().split("T")[0],
      asal_surat: asal_surat || "Belum teridentifikasi",
      perihal: "Dalam proses analisis AI",
      media_terima,
      file_surat: filePath,
      ai_status: "pending",
      status: "masuk",
      diterima_oleh: userId,
      keterangan: keterangan || null,
    });

    // Buat record agenda surat
    const now = new Date();
    await AgendaSurat.create({
      nomor_agenda,
      jenis: "masuk",
      referensi_id: surat.id,
      tanggal: now.toISOString().split("T")[0],
      dari_kepada: asal_surat || "Belum teridentifikasi",
      tahun: now.getFullYear(),
      bulan: now.getMonth() + 1,
    });

    // Trigger AI processing secara async (tidak perlu await)
    if (filePath) {
      processWithAI(surat.id, filePath).catch((err) =>
        console.error("[uploadSuratMasuk] AI trigger error:", err.message),
      );
    }

    return res.status(201).json({
      success: true,
      data: {
        id: surat.id,
        nomor_agenda: surat.nomor_agenda,
        ai_status: surat.ai_status,
      },
      message: "Surat masuk berhasil diunggah. AI sedang memproses.",
    });
  } catch (error) {
    console.error("[uploadSuratMasuk]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengunggah surat masuk." });
  }
};

// GET /api/surat/masuk
export const getAllSuratMasuk = async (req, res) => {
  try {
    const { status, ai_status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (ai_status) where.ai_status = ai_status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await SuratMasuk.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error("[getAllSuratMasuk]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data surat masuk." });
  }
};

// GET /api/surat/masuk/:id
export const getSuratMasukById = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat tidak ditemukan." });
    }

    const disposisiList = await Disposisi.findAll({
      where: { surat_masuk_id: surat.id },
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, data: { ...surat.toJSON(), disposisi: disposisiList } });
  } catch (error) {
    console.error("[getSuratMasukById]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil detail surat." });
  }
};

// PUT /api/surat/masuk/:id/konfirmasi
export const konfirmasiSuratMasuk = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat tidak ditemukan." });
    }

    const {
      nomor_surat,
      tanggal_surat,
      asal_surat,
      perihal,
      isi_ringkas,
      jenis_surat,
      sifat_surat,
      ditujukan_kepada,
      keterangan,
    } = req.body;

    await surat.update({
      nomor_surat: nomor_surat ?? surat.nomor_surat,
      tanggal_surat: tanggal_surat ?? surat.tanggal_surat,
      asal_surat: asal_surat ?? surat.asal_surat,
      perihal: perihal ?? surat.perihal,
      isi_ringkas: isi_ringkas ?? surat.isi_ringkas,
      jenis_surat: jenis_surat ?? surat.jenis_surat,
      sifat_surat: sifat_surat ?? surat.sifat_surat,
      ditujukan_kepada: ditujukan_kepada ?? surat.ditujukan_kepada,
      keterangan: keterangan ?? surat.keterangan,
      status: "disposisi",
    });

    return res.json({
      success: true,
      data: surat,
      message: "Surat berhasil dikonfirmasi dan diteruskan ke pimpinan.",
    });
  } catch (error) {
    console.error("[konfirmasiSuratMasuk]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengkonfirmasi surat." });
  }
};

// POST /api/surat/masuk/disposisi
export const buatDisposisi = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      surat_masuk_id,
      kepada_user_id,
      kepada_unit,
      instruksi,
      catatan,
      batas_waktu,
      prioritas = "Normal",
    } = req.body;

    if (!surat_masuk_id || !kepada_user_id || !instruksi) {
      return res.status(400).json({
        success: false,
        message: "surat_masuk_id, kepada_user_id, dan instruksi wajib diisi.",
      });
    }

    const surat = await SuratMasuk.findByPk(surat_masuk_id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat tidak ditemukan." });
    }

    const disposisi = await Disposisi.create({
      surat_masuk_id,
      dari_user_id: userId,
      kepada_user_id,
      kepada_unit: kepada_unit || null,
      instruksi,
      catatan: catatan || null,
      batas_waktu: batas_waktu || null,
      prioritas,
      status: "belum_dibaca",
    });

    // Update status surat ke 'proses'
    await surat.update({ status: "proses" });

    return res.status(201).json({
      success: true,
      data: disposisi,
      message: "Disposisi berhasil dibuat.",
    });
  } catch (error) {
    console.error("[buatDisposisi]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal membuat disposisi." });
  }
};

// PUT /api/surat/disposisi/:id/selesai
export const selesaikanDisposisi = async (req, res) => {
  try {
    const disposisi = await Disposisi.findByPk(req.params.id);
    if (!disposisi) {
      return res
        .status(404)
        .json({ success: false, message: "Disposisi tidak ditemukan." });
    }

    const fileBalasan = req.files
      ? req.files.map((f) => ({ path: f.path, originalname: f.originalname }))
      : null;

    await disposisi.update({
      status: "selesai",
      tanggal_selesai: new Date(),
      hasil_tindak_lanjut: req.body.hasil_tindak_lanjut || null,
      file_balasan: fileBalasan || disposisi.file_balasan,
    });

    // Cek apakah semua disposisi untuk surat ini sudah selesai
    const allDisposisi = await Disposisi.findAll({
      where: { surat_masuk_id: disposisi.surat_masuk_id },
    });
    const semuaSelesai = allDisposisi.every((d) => d.status === "selesai");

    if (semuaSelesai) {
      const surat = await SuratMasuk.findByPk(disposisi.surat_masuk_id);
      if (surat) {
        const arsipCode = generateArsipCode(surat.perihal);
        const namaKlasifikasi = KODE_KLASIFIKASI_ARSIP[arsipCode] || "Umum";

        await surat.update({ status: "selesai", arsip_code: arsipCode });

        // Auto-arsip
        await ArsipSurat.create({
          kode_klasifikasi: arsipCode,
          nama_klasifikasi: namaKlasifikasi,
          referensi_type: "surat_masuk",
          referensi_id: surat.id,
          tanggal_arsip: new Date().toISOString().split("T")[0],
          diarsipkan_oleh: req.user.id,
        });
      }
    }

    return res.json({
      success: true,
      data: disposisi,
      message: "Disposisi berhasil diselesaikan.",
    });
  } catch (error) {
    console.error("[selesaikanDisposisi]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menyelesaikan disposisi." });
  }
};

// GET /api/surat/disposisi/saya
export const getDisposisiSaya = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const where = { kepada_user_id: userId };
    if (status) where.status = status;

    const disposisiList = await Disposisi.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, data: disposisiList });
  } catch (error) {
    console.error("[getDisposisiSaya]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil disposisi." });
  }
};
