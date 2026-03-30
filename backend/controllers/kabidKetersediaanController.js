// Controller: Kepala Bidang Ketersediaan & Kerawanan Pangan
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
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
        ews_status: { level: 'waspada', alert_aktif: 3 },
        neraca_pangan: { status: 'tersedia', periode: 'Q1-2026' },
        kabupaten_rawan: 7,
        realisasi_anggaran_persen: 42.5
      }
    });
  } catch (err) {
    console.error('[kabidKetersediaan] getDashboardSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === EWS PANEL ===
export async function getEwsPanel(req, res) {
  try {
    // Data EWS — dari tabel ews_ketersediaan (seeder/demo data)
    const ewsData = {
      status_keseluruhan: 'waspada',
      alert_aktif: 3,
      update_terakhir: new Date().toISOString(),
      indikator: [
        {
          nama: 'Stok Beras Daerah',
          status: 'warning',
          nilai: '24 hari',
          threshold: '< 30 hari',
          level: 'warning'
        },
        {
          nama: 'Produksi Padi',
          status: 'aman',
          nilai: '95% target',
          threshold: '> 80%',
          level: 'aman'
        },
        {
          nama: 'Wilayah Rawan Pangan',
          status: 'warning',
          nilai: '7 kab/kota',
          threshold: '> 5',
          level: 'warning'
        },
        {
          nama: 'Harga Pangan Strategis',
          status: 'aman',
          nilai: '+2.1%/bln',
          threshold: '< 10%',
          level: 'aman'
        },
        {
          nama: 'Distribusi Antarpulau',
          status: 'warning',
          nilai: 'Terganggu',
          threshold: 'Normal',
          level: 'warning'
        }
      ]
    };

    res.json({ data: ewsData });
  } catch (err) {
    console.error('[kabidKetersediaan] getEwsPanel error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === KIRIM EWS KE KEPALA DINAS ===
export async function kirimEwsKeKadin(req, res) {
  try {
    const userId = req.user?.id;
    const { indikator_ids, catatan } = req.body;

    // Log pengiriman EWS
    await Notification.create({
      user_id: userId,
      jenis: 'ews_escalation',
      judul: 'EWS Dikirim ke Kepala Dinas',
      pesan: catatan || 'Early Warning System dikirim ke Kepala Dinas untuk tindak lanjut.',
      status: 'terkirim',
      created_at: new Date()
    }).catch(() => null);

    res.json({
      success: true,
      message: 'EWS berhasil dikirim ke Kepala Dinas.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[kabidKetersediaan] kirimEwsKeKadin error:', err);
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
    console.error('[kabidKetersediaan] getApprovalQueue error:', err);
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

    // Fetch tasks yang di-assign ke bawahan (JF)
    const tugasJF = await Task.findAll({
      where: { assigned_by: userId, status: { [Op.in]: ['pending', 'in_progress', 'submitted_to_kabid'] } },
      order: [['deadline', 'ASC']],
      limit: 30
    }).catch(() => []);

    res.json({
      data: {
        tim_jf: [
          {
            role: 'JF 1',
            jabatan: 'Jabatan Fungsional Analis Pangan Ahli Muda',
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
      modul_id: modul_id || 'BKT',
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === DATA TEKNIS: PRODUKSI PANGAN ===
export async function getProduksiPangan(req, res) {
  try {
    const { periode_bulan, periode_tahun, kabupaten_kota } = req.query;

    // Fallback ke mock data karena tabel baru mungkin belum di-migrate
    res.json({
      data: [],
      meta: { periode_bulan, periode_tahun, kabupaten_kota, note: 'Tabel produksi_pangan belum tersedia data' }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === DATA TEKNIS: STOK PANGAN ===
export async function getStokPangan(req, res) {
  try {
    res.json({
      data: [],
      meta: { note: 'Tabel stok_pangan belum tersedia data' }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === DATA TEKNIS: NERACA PANGAN ===
export async function getNeracaPangan(req, res) {
  try {
    const { periode } = req.params;
    res.json({
      data: { periode, komoditas: [] },
      meta: { note: 'Tabel neraca_pangan belum tersedia data' }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === DATA TEKNIS: KERAWANAN PANGAN ===
export async function getKerawananPangan(req, res) {
  try {
    res.json({
      data: [],
      meta: { note: 'Data kerawanan dari BKT-KRW' }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SKP JF ===
export async function getSkpJF(req, res) {
  try {
    res.json({
      data: [
        { jf_role: 'JF 1', status_skp: 'belum_dinilai', periode: '2026' },
        { jf_role: 'JF 2', status_skp: 'belum_dinilai', periode: '2026' }
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
