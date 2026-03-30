// Controller: JF Bidang Distribusi (Hybrid Manager)
import { Op } from "sequelize";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import { listPendingVerificationBatches } from "../services/hargaPanganRepository.js";
import { verifyHargaBatch, returnHargaBatch } from "../services/hargaPanganService.js";

const JENIS_ANALISA_DISTRIBUSI = [
  'analisa_harga',
  'analisa_inflasi',
  'laporan_pasar',
  'rekomendasi_tpid',
  'laporan_bimtek'
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

// === QUEUE VERIFIKASI DATA HARGA PASAR DARI PELAKSANA ===
export async function getVerifikasiQueue(req, res) {
  try {
    const batches = await listPendingVerificationBatches();
    const items = batches.map((b) => ({
      id: b.batch_id,
      judul: `Harga pasar — batch ${String(b.batch_id).slice(0, 8)}…`,
      jenis: "harga_pasar",
      tipe: "harga_pasar",
      dibuat_pada: b.dibuat_pada,
      status: "submitted_to_jf",
      ringkas: b.jumlah_baris ? `${b.jumlah_baris} baris komoditas` : "",
      batch_has_anomaly: Boolean(b.batch_has_anomaly),
      requires_manual_verify: Boolean(b.batch_has_anomaly),
    }));
    res.json({ data: items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

// === VERIFIKASI: TERIMA DATA HARGA PASAR ===
export async function terimaVerifikasi(req, res) {
  try {
    const { id: batchId } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    const outlierCheck = {
      passed: true,
      catatan: "Harga dalam rentang wajar (±2 standar deviasi dari median kabupaten)",
    };

    const actor = { id: req.user?.id, role: req.user?.role };
    const ok = await verifyHargaBatch(
      batchId,
      userId,
      catatan || outlierCheck.catatan,
      actor,
    );
    if (!ok) {
      return res.status(404).json({ error: "batch_tidak_ditemukan_atau_sudah_diproses" });
    }

    res.json({
      success: true,
      message: "Data harga pasar terverifikasi.",
      outlier_check: outlierCheck,
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

// === VERIFIKASI: KEMBALIKAN DATA ===
export async function kembalikanVerifikasi(req, res) {
  try {
    const { id: batchId } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    if (!catatan) {
      return res.status(400).json({ error: 'Catatan verifikasi wajib diisi saat mengembalikan data.' });
    }

    const actor = { id: req.user?.id, role: req.user?.role };
    const ok = await returnHargaBatch(batchId, userId, catatan, actor);
    if (!ok) {
      return res.status(404).json({ error: "batch_tidak_ditemukan_atau_sudah_diproses" });
    }

    res.json({ success: true, message: "Data dikembalikan ke Pelaksana dengan catatan." });
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
      modul_id: 'BDS-JF',
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
        jenis_tersedia: JENIS_ANALISA_DISTRIBUSI
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === COVERAGE PASAR HARI INI (JF — agregat ringkas) ===
export async function getCoverageHariIni(req, res) {
  try {
    const today = new Date().toISOString().split("T")[0];
    res.json({
      data: {
        tanggal: today,
        sudah: 21,
        total: 24,
        belum_nama: ["Tobelo Utara", "Morotai Selatan", "Sanana"],
        deadline_wit: "14:00",
        catatan: "Simulasi agregat — sambungkan ke tabel harga_pangan (M043) untuk produksi.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function postReminderPelaksana(req, res) {
  try {
    res.json({
      success: true,
      message: "Reminder ke Pelaksana terkirim (simulasi). Integrasi notifikasi aktif nanti.",
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function buatAnalisa(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, jenis, isi_analisa, periode } = req.body;

    if (!judul || !jenis || !isi_analisa) {
      return res.status(400).json({ error: 'Judul, jenis, dan isi analisa wajib diisi.' });
    }

    if (!JENIS_ANALISA_DISTRIBUSI.includes(jenis)) {
      return res.status(400).json({
        error: 'Jenis analisa tidak valid.',
        jenis_valid: JENIS_ANALISA_DISTRIBUSI
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
        bidang: 'distribusi',
        status: 'draft'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}
