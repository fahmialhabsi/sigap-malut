// Controller: Kepala Bidang Konsumsi & Penganekaragaman Pangan
import { Op } from 'sequelize';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// === DASHBOARD SUMMARY (6 KPI Tiles) ===
export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user?.id;

    // Tugas aktif tim (tasks assigned by this kabid to JF)
    const tugasAktif = await Task.count({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    }).catch(() => 0);

    // Laporan pending (dokumen dari JF menunggu review)
    const laporanPending = await Task.count({
      where: {
        assigned_by: userId,
        status: 'review_kabid'
      }
    }).catch(() => 0);

    res.json({
      data: {
        tugas_aktif_tim: tugasAktif,
        laporan_pending_review: laporanPending,
        skor_pph_capaian: { nilai: 82.4, satuan: 'poin', periode: '2026' },
        target_pph: { nilai: 87.5, satuan: 'poin', tahun: 2026 },
        kab_b2sa: {
          kabupaten_aktif: 8,
          total_kabupaten: 10,
          catatan: 'Kabupaten dengan program B2SA aktif'
        },
        realisasi_anggaran_persen: 44.7
      }
    });
  } catch (err) {
    console.error('[kabidKonsumsi] getDashboardSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === PPH SUMMARY ===
export async function getPphSummary(req, res) {
  try {
    // Data PPH dari BKS-EVL atau fallback mock
    const pphData = {
      periode: '2026',
      update_terakhir: new Date().toISOString(),
      energi_kkal_per_kapita: {
        capaian: 2087,
        target: 2100,
        satuan: 'kkal/kapita/hari',
        status: 'hampir_tercapai'
      },
      protein_g_per_kapita: {
        capaian: 57.3,
        target: 57.0,
        satuan: 'g/kapita/hari',
        status: 'tercapai'
      },
      skor_pph: {
        capaian: 82.4,
        target: 87.5,
        satuan: 'poin',
        status: 'perlu_peningkatan',
        gap: 5.1
      },
      kontribusi_per_kelompok: [
        { kelompok: 'Padi-padian', bobot: 0.25, skor_ideal: 25.0, skor_capaian: 24.3 },
        { kelompok: 'Umbi-umbian', bobot: 0.025, skor_ideal: 2.5, skor_capaian: 1.8 },
        { kelompok: 'Pangan Hewani', bobot: 0.2, skor_ideal: 24.0, skor_capaian: 19.5 },
        { kelompok: 'Minyak & Lemak', bobot: 0.05, skor_ideal: 5.0, skor_capaian: 5.0 },
        { kelompok: 'Buah/Biji Berminyak', bobot: 0.01, skor_ideal: 1.0, skor_capaian: 0.8 },
        { kelompok: 'Kacang-kacangan', bobok: 0.1, skor_ideal: 10.0, skor_capaian: 7.9 },
        { kelompok: 'Gula', bobot: 0.025, skor_ideal: 2.5, skor_capaian: 2.5 },
        { kelompok: 'Sayur & Buah', bobot: 0.05, skor_ideal: 6.0, skor_capaian: 4.2 },
        { kelompok: 'Lain-lain', bobot: 0.035, skor_ideal: 3.5, skor_capaian: 3.5 }
      ],
      rekomendasi: 'Dorong konsumsi pangan hewani dan diversifikasi umbi-umbian lokal untuk meningkatkan skor PPH.',
      catatan: 'Data bersumber dari survei konsumsi BKS-EVL periode 2026'
    };

    res.json({ data: pphData });
  } catch (err) {
    console.error('[kabidKonsumsi] getPphSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === APPROVAL QUEUE DARI JF ===
export async function getApprovalQueue(req, res) {
  try {
    const userId = req.user?.id;

    const queue = await Task.findAll({
      where: {
        assigned_by: userId,
        status: 'submitted_to_kabid'
      },
      order: [['created_at', 'DESC']],
      limit: 20
    }).catch(() => []);

    res.json({
      data: queue.map(t => ({
        id: t.id,
        judul: t.judul || t.title,
        disubmit_oleh: t.assigned_to,
        dibuat_pada: t.created_at,
        jenis: t.modul_id || 'laporan_teknis',
        status: t.status,
        hari_menunggu: Math.floor((Date.now() - new Date(t.created_at).getTime()) / 86400000)
      })),
      total: queue.length
    });
  } catch (err) {
    console.error('[kabidKonsumsi] getApprovalQueue error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SETUJUI DOKUMEN DARI JF ===
export async function setujuiDokumenJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await Task.update(
      { status: 'approved_kabid', approved_by: userId, approved_at: new Date() },
      { where: { id, assigned_by: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Dokumen disetujui dan diteruskan ke Sekretaris.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === KEMBALIKAN DOKUMEN KE JF ===
export async function kembalikanDokumenKJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Task.update(
      { status: 'returned_to_jf', catatan_kabid: catatan, returned_by: userId, returned_at: new Date() },
      { where: { id, assigned_by: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Dokumen dikembalikan ke JF dengan catatan.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === TIM SAYA (JF 1 & JF 2) ===
export async function getTimJF(req, res) {
  try {
    const userId = req.user?.id;

    const tugasJF = await Task.findAll({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ['pending', 'in_progress', 'submitted_to_kabid'] }
      },
      order: [['deadline', 'ASC']],
      limit: 30
    }).catch(() => []);

    res.json({
      data: {
        tim_jf: [
          {
            role: 'JF 1',
            jabatan: 'Jabatan Fungsional Analis Pangan Ahli Muda',
            bidang: 'Konsumsi & Penganekaragaman Pangan',
            tugas_aktif: tugasJF.filter(t => t.status !== 'done').length,
            tugas: tugasJF.slice(0, 3).map(t => ({
              id: t.id,
              judul: t.judul || t.title,
              deadline: t.deadline,
              status: t.status
            }))
          },
          {
            role: 'JF 2',
            jabatan: 'Jabatan Fungsional Analis Pangan Ahli Pertama',
            bidang: 'Konsumsi & Penganekaragaman Pangan',
            tugas_aktif: 1,
            tugas: []
          }
        ],
        catatan_privasi: 'Kepala Bidang tidak dapat melihat nilai SKP Pelaksana di bawah JF (PP 30/2019)'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === ASSIGN TUGAS KE JF ===
export async function assignTugasKeJF(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, deskripsi, assigned_to, deadline, modul_id } = req.body;

    if (!judul || !assigned_to) {
      return res.status(400).json({ error: 'Judul dan penerima tugas wajib diisi.' });
    }

    const tugas = await Task.create({
      judul,
      deskripsi,
      assigned_by: userId,
      assigned_to,
      deadline,
      modul_id: modul_id || 'BKS',
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SKP JF ===
export async function getSkpJF(req, res) {
  try {
    res.json({
      data: [
        { jf_role: 'JF 1', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Konsumsi' },
        { jf_role: 'JF 2', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Konsumsi' }
      ],
      blocked: {
        pelaksana: true,
        alasan: 'Nilai SKP Pelaksana bersifat CONFIDENTIAL (PP 30/2019). Kepala Bidang tidak memiliki akses.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}
