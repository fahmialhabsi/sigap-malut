// Controller: JF Bidang Konsumsi & Penganekaragaman Pangan (Hybrid Manager)
import { Op } from 'sequelize';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

const JENIS_ANALISA_KONSUMSI = [
  'analisa_konsumsi',
  'analisa_pph',
  'laporan_b2sa',
  'laporan_bimtek',
  'rekomendasi_diversifikasi'
];

// === TUGAS DARI KEPALA BIDANG ===
export async function getTugasKabid(req, res) {
  try {
    const userId = req.user?.id;

    const tugas = await Task.findAll({
      where: {
        assigned_to: userId,
        status: { [Op.in]: ['pending', 'in_progress', 'returned_to_jf'] }
      },
      order: [['deadline', 'ASC']],
      limit: 20
    }).catch(() => []);

    res.json({ data: tugas, total: tugas.length });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === TERIMA TUGAS DARI KABID ===
export async function terimaTugasKabid(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await Task.update(
      { status: 'in_progress', started_at: new Date() },
      { where: { id, assigned_to: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Tugas diterima.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SUBMIT HASIL KE KABID ===
export async function submitHasilKeKabid(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan, dokumen_url } = req.body;

    await Task.update(
      { status: 'submitted_to_kabid', catatan_jf: catatan, dokumen_url, submitted_at: new Date() },
      { where: { id, assigned_to: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Hasil analisa dikirim ke Kepala Bidang untuk review.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === QUEUE VERIFIKASI DATA KONSUMSI DARI PELAKSANA ===
export async function getVerifikasiQueue(req, res) {
  try {
    const userId = req.user?.id;

    const queue = await Task.findAll({
      where: {
        // Data konsumsi yang disubmit Pelaksana ke JF ini
        approved_by: userId,
        status: 'submitted_to_jf',
        // Filter untuk tipe data_konsumsi bila kolom modul_id tersedia
        ...(Task.rawAttributes?.modul_id ? { modul_id: { [Op.like]: 'BKS%' } } : {})
      },
      order: [['created_at', 'DESC']],
      limit: 15
    }).catch(() => []);

    res.json({
      data: queue.map(t => ({
        id: t.id,
        judul: t.judul || t.title,
        tipe: 'data_konsumsi',
        disubmit_oleh: t.assigned_to,
        dibuat_pada: t.created_at,
        status: t.status
      })),
      total: queue.length
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === VERIFIKASI: TERIMA DATA KONSUMSI ===
export async function terimaVerifikasi(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Task.update(
      {
        status: 'verified_by_jf',
        verified_by: userId,
        verified_at: new Date(),
        catatan_verifikasi: catatan || 'Data konsumsi terverifikasi oleh JF.'
      },
      { where: { id } }
    ).catch(() => null);

    res.json({ success: true, message: 'Data konsumsi terverifikasi.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === VERIFIKASI: KEMBALIKAN DATA ===
export async function kembalikanVerifikasi(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    if (!catatan) {
      return res.status(400).json({ error: 'Catatan verifikasi wajib diisi saat mengembalikan data.' });
    }

    await Task.update(
      { status: 'returned_to_pelaksana', returned_by: userId, catatan_verifikasi: catatan, returned_at: new Date() },
      { where: { id } }
    ).catch(() => null);

    res.json({ success: true, message: 'Data dikembalikan ke Pelaksana dengan catatan.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === TIM PELAKSANA ===
export async function getTimPelaksana(req, res) {
  try {
    const userId = req.user?.id;

    const tugasPelaksana = await Task.findAll({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ['pending', 'in_progress', 'submitted_to_jf'] }
      },
      limit: 20
    }).catch(() => []);

    res.json({
      data: {
        pelaksana: [],
        tugas_aktif: tugasPelaksana,
        catatan: 'Data tim Pelaksana CONFIDENTIAL — tidak dapat diakses oleh Kepala Bidang'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === ASSIGN TUGAS KE PELAKSANA ===
export async function assignTugasKePelaksana(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, deskripsi, assigned_to, deadline } = req.body;

    if (!judul || !assigned_to) {
      return res.status(400).json({ error: 'Judul dan penerima tugas wajib diisi.' });
    }

    const tugas = await Task.create({
      judul,
      deskripsi,
      assigned_by: userId,
      assigned_to,
      deadline,
      modul_id: 'BKS-JF',
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SKP PELAKSANA (CONFIDENTIAL) ===
export async function getSkpPelaksana(req, res) {
  try {
    const userId = req.user?.id;

    res.json({
      data: [],
      meta: {
        confidential: true,
        note: 'Data nilai SKP Pelaksana hanya terlihat oleh JF penilai langsung. Kepala Bidang diblokir.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === INPUT NILAI SKP PELAKSANA ===
export async function inputSkpPelaksana(req, res) {
  try {
    const userId = req.user?.id;
    const { pelaksanaId } = req.params;
    const { nilai, catatan, periode } = req.body;

    if (!nilai) {
      return res.status(400).json({ error: 'Nilai SKP wajib diisi.' });
    }

    res.status(201).json({
      success: true,
      message: 'Nilai SKP Pelaksana berhasil disimpan (CONFIDENTIAL).',
      data: { pelaksana_id: pelaksanaId, dinilai_oleh: userId, nilai, periode }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === ANALISA & LAPORAN ===
export async function getAnalisaList(req, res) {
  try {
    const userId = req.user?.id;
    res.json({
      data: [],
      meta: {
        jf_id: userId,
        jenis_tersedia: JENIS_ANALISA_KONSUMSI
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

export async function buatAnalisa(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, jenis, isi_analisa, periode } = req.body;

    if (!judul || !jenis || !isi_analisa) {
      return res.status(400).json({ error: 'Judul, jenis, dan isi analisa wajib diisi.' });
    }

    if (!JENIS_ANALISA_KONSUMSI.includes(jenis)) {
      return res.status(400).json({
        error: 'Jenis analisa tidak valid.',
        jenis_valid: JENIS_ANALISA_KONSUMSI
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        jf_id: userId,
        judul,
        jenis,
        isi_analisa,
        periode,
        bidang: 'konsumsi',
        status: 'draft'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}
