// backend/controllers/pelaksana/spjController.js  
// SPJ Pelaksana — BAGIAN C.5 + H (KRITIS: Pelaksana SATU-SATUNYA boleh buat SPJ)
// spjSelfGuard wajib di routes!

import Spj from '../../../models/Spj.js';
import sequelize from '../../../config/database.js';
import Notification from '../../../models/Notification.js';
import { pelaksanaRoleGuard, spjSelfGuard } from '../../../middleware/pelaksanaRoleGuard.js';

const userId = (req) => req.user.id;

// ── GET /api/pelaksana/spj — Riwayat SPJ saya (BAGIAN D.3 Panel SPJ Saya) ──
export const getSpjSaya = async (req, res) => {
  try {
    const uid = userId(req);
    const { status, periode, limit = 10 } = req.query;

    const where = {
      dibuat_oleh: uid,
      deleted_at: null
    };

    if (status) where.status = { [Op.in]: status.split(',') };

    const spjs = await Spj.findAll({
      where,
      order: [['updated_at', 'DESC']],
      limit: Number(limit)
    });

    // Enrich dengan timeline/status changes (dari spj_logs jika ada)
    res.json({ success: true, data: spjs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj — Buat SPJ baru (multi-jenis: SPPD/Honor/ATK) ──
export const buatSpj = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const uid = userId(req);
    const { 
      jenis_spj, // 'SPPD' | 'HONOR' | 'ATK' | 'LAIN'
      nomor_sppd, 
      tujuan, 
      tanggal_berangkat, 
      tanggal_kembali, 
      moda_transportasi,
      total_nominal,
      deskripsi_hasil,
      lampiran_required // array checklist lampiran berdasarkan jenis
    } = req.body;

    // Validasi berdasarkan jenis
    const validJenis = ['SPPD', 'HONOR', 'ATK', 'LAIN'];
    if (!validJenis.includes(jenis_spj)) {
      return res.status(400).json({ success: false, message: 'Jenis SPJ tidak valid' });
    }

    // spjSelfGuard sudah paksa dibuat_oleh/penerima_uang_id = uid

    const spj = await Spj.create({
      dibuat_oleh: uid,
      jenis_spj,
      nomor_sppd: jenis_spj === 'SPPD' ? nomor_sppd : null,
      tujuan,
      tanggal_berangkat: jenis_spj === 'SPPD' ? tanggal_berangkat : null,
      tanggal_kembali: jenis_spj === 'SPPD' ? tanggal_kembali : null, 
      moda_transportasi: jenis_spj === 'SPPD' ? moda_transportasi : null,
      total_nominal: parseFloat(total_nominal),
      deskripsi_hasil,
      status: 'DRAFT',
      lampiran_required: JSON.stringify(lampiran_required || []),
      metadata: { jenis_spj } // untuk template form
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ success: true, data: spj });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /api/pelaksana/spj/:id — Update DRAFT SPJ ──
export const updateSpjDraft = async (req, res) => {
  try {
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        dibuat_oleh: userId(req),
        status: 'DRAFT'
      }
    });

    if (!spj) {
      return res.status(404).json({ success: false, message: 'SPJ draft tidak ditemukan' });
    }

    await spj.update(req.body);
    res.json({ success: true, data: spj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj/:id/submit — Submit ke Bendahara ──
export const submitSpj = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        dibuat_oleh: userId(req),
        status: 'DRAFT'
      }
    });

    if (!spj) {
      return res.status(404).json({ success: false, message: 'SPJ draft tidak ditemukan' });
    }

    // Validasi checklist lampiran wajib lengkap (per jenis_spj)
    const lampiranStatus = checkLampiranLengkap(spj.jenis_spj, spj.lampiran_required);
    if (!lampiranStatus.lengkap) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lampiran wajib belum lengkap',
        missing: lampiranStatus.missing 
      });
    }

    spj.status = 'DIAJUKAN_KE_BENDAHARA';
    spj.submitted_at = new Date();
    await spj.save({ transaction: t });

    // Notif ke Bendahara Pengeluaran
    const bendaharaIds = await getBendaharaIds(); // implement service
    for (const bid of bendaharaIds) {
      await Notification.create({
        target_user_id: bid,
        spj_id: spj.id,
        message: `SPJ baru dari ${req.user.nama_lengkap}: ${spj.judul}`,
        link: `/spj/${spj.id}`
      });
    }

    await t.commit();
    res.json({ success: true, data: spj });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj/:id/perbaiki — Submit ulang setelah dikembalikan ──
export const perbaikiSpj = async (req, res) => {
  // Sama seperti submit, tapi update status REVISI → DIAJUKAN lagi + log revisi counter
  res.json({ success: true, message: 'Perbaiki SPJ (reuse submit + revisi counter)' });
};

// ── GET /api/pelaksana/spj/:id/export — Download PDF SPJ disetujui ──
export const exportSpj = async (req, res) => {
  try {
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        dibuat_oleh: userId(req),
        status: { [Op.in]: ['DISETUJUI', 'DIBAYARKAN'] }
      }
    });

    if (!spj) {
      return res.status(404).json({ success: false, message: 'SPJ tidak ditemukan atau belum disetujui' });
    }

    // Generate PDF (html-pdf or puppeteer)
    const pdfBuffer = await generateSpjPdf(spj);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SPJ-${spj.nomor_spj || spj.id}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Helper functions ──
function checkLampiranLengkap(jenis, required) {
  // Logic per jenis_spj: cek field lampiran_* tidak null
  const missing = [];
  // Implementasi berdasarkan Spj model fields
  return { lengkap: missing.length === 0, missing };
}

async function getBendaharaIds() {
  // Query users role='bendahara_pengeluaran' aktif
  return []; // placeholder
}

async function generateSpjPdf(spj) {
  // Puppeteer/PDFKit generate PDF dari template
  return Buffer.from(''); // placeholder
}

export { checkLampiranLengkap };

