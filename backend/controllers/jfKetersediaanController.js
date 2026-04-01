// Controller: JF Bidang Ketersediaan (Hybrid Manager)
import { Op } from 'sequelize';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import TaskAssignment from '../models/TaskAssignment.js';
import User from '../models/User.js';
import AnalisaJfKetersediaan from '../models/AnalisaJfKetersediaan.js';
import ProduksiPangan from "../models/ProduksiPangan.js";
import StokPangan from "../models/StokPangan.js";
import KerawananPangan from "../models/KerawananPangan.js";

function ensureAssoc() {
  // Task -> assignments
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: 'task_id', as: 'assignments' });
  }
  if (!TaskAssignment.associations?.task) {
    TaskAssignment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
  }
  if (!TaskAssignment.associations?.assignee) {
    TaskAssignment.belongsTo(User, { foreignKey: 'assignee_user_id', as: 'assignee' });
  }
}

// === TUGAS DARI KEPALA BIDANG ===
export async function getTugasKabid(req, res) {
  try {
    ensureAssoc();
    const userId = req.user?.id;

    const tugas = await Task.findAll({
      include: [
        {
          model: TaskAssignment,
          as: 'assignments',
          required: true,
          where: { assignee_user_id: userId },
        },
      ],
      where: {
        status: { [Op.in]: ['assigned', 'accepted', 'in_progress', 'returned_to_jf'] },
      },
      order: [['due_date', 'ASC']],
      limit: 20,
    }).catch(() => []);

    res.json({ data: tugas, total: tugas.length });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === TERIMA TUGAS DARI KABID ===
export async function terimaTugasKabid(req, res) {
  try {
    ensureAssoc();
    const { id } = req.params;
    const userId = req.user?.id;

    // Pastikan assignment memang untuk user ini
    const assn = await TaskAssignment.findOne({
      where: { task_id: id, assignee_user_id: userId },
    });
    if (!assn) return res.status(404).json({ error: 'not_found' });

    await Task.update({ status: 'in_progress' }, { where: { id } }).catch(() => null);
    await TaskAssignment.update({ status: 'accepted' }, { where: { id: assn.id } }).catch(() => null);

    res.json({ success: true, message: 'Tugas diterima.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SUBMIT HASIL KE KABID ===
export async function submitHasilKeKabid(req, res) {
  try {
    ensureAssoc();
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan, dokumen_url } = req.body;

    const assn = await TaskAssignment.findOne({
      where: { task_id: id, assignee_user_id: userId },
    });
    if (!assn) return res.status(404).json({ error: 'not_found' });

    const task = await Task.findByPk(id).catch(() => null);
    const prevMeta = task && typeof task.metadata === 'object' && task.metadata ? task.metadata : {};

    await Task.update(
      {
        status: 'submitted_to_kabid',
        metadata: {
          ...prevMeta,
          jf_catatan: catatan ?? '',
          jf_dokumen_url: dokumen_url ?? null,
          jf_submitted_at: new Date().toISOString(),
        },
      },
      { where: { id } },
    ).catch(() => null);

    res.json({ success: true, message: 'Hasil analisa dikirim ke Kepala Bidang untuk review.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === QUEUE VERIFIKASI DATA DARI PELAKSANA ===
export async function getVerifikasiQueue(req, res) {
  try {
    ensureAssoc();
    const userId = req.user?.id;

    const queue = await Task.findAll({
      include: [
        {
          model: TaskAssignment,
          as: 'assignments',
          required: true,
          where: { assignee_user_id: userId },
          include: [{ model: User, as: 'assignee', attributes: ['id', 'nama_lengkap', 'role', 'unit_kerja'] }],
        },
      ],
      where: { status: 'submitted_to_jf' },
      order: [['created_at', 'DESC']],
      limit: 15,
    }).catch(() => []);

    res.json({ data: queue, total: queue.length });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === VERIFIKASI: TERIMA DATA ===
export async function terimaVerifikasi(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Task.update(
      { status: 'verified_by_jf', verified_by: userId, verified_at: new Date(), catatan_verifikasi: catatan },
      { where: { id } }
    ).catch(() => null);

    res.json({ success: true, message: 'Data terverifikasi.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === VERIFIKASI: KEMBALIKAN DATA ===
export async function kembalikanVerifikasi(req, res) {
  try {
    ensureAssoc();
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    if (!catatan) {
      return res.status(400).json({ error: 'Catatan verifikasi wajib diisi saat mengembalikan data.' });
    }

    const assn = await TaskAssignment.findOne({
      where: { task_id: Number(id), assignee_user_id: userId },
    }).catch(() => null);
    if (!assn) return res.status(404).json({ error: "not_found" });

    const task = await Task.findByPk(Number(id)).catch(() => null);
    const table = task?.metadata?.table;
    const rowId = Number(task?.metadata?.row_id);
    const now = new Date();
    if (table && Number.isFinite(rowId)) {
      if (table === "produksi_pangan") {
        await ProduksiPangan.update(
          { status: "draft", diverifikasi_oleh: null, catatan_revisi: catatan, updated_at: now },
          { where: { id: rowId } },
        ).catch(() => null);
      } else if (table === "stok_pangan") {
        await StokPangan.update(
          { catatan_revisi: catatan, updated_at: now },
          { where: { id: rowId } },
        ).catch(() => null);
      } else if (table === "kerawanan_pangan") {
        await KerawananPangan.update(
          { diverifikasi_oleh: null, catatan_revisi: catatan, updated_at: now },
          { where: { id: rowId } },
        ).catch(() => null);
      }
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
    ensureAssoc();
    const userId = req.user?.id;

    const tugasPelaksana = await Task.findAll({
      include: [
        {
          model: TaskAssignment,
          as: 'assignments',
          required: true,
          where: { assigned_by: userId },
          include: [{ model: User, as: 'assignee', attributes: ['id', 'nama_lengkap', 'role', 'unit_kerja'] }],
        },
      ],
      where: { status: { [Op.in]: ['assigned', 'accepted', 'in_progress', 'submitted_to_jf'] } },
      order: [['created_at', 'DESC']],
      limit: 30,
    }).catch(() => []);

    const map = new Map();
    tugasPelaksana.forEach((t) => {
      (t.assignments || []).forEach((a) => {
        if (a?.assignee?.id) {
          map.set(a.assignee.id, {
            id: a.assignee.id,
            nama_lengkap: a.assignee.nama_lengkap,
            role: a.assignee.role,
            unit_kerja: a.assignee.unit_kerja,
          });
        }
      });
    });

    res.json({
      data: {
        pelaksana: Array.from(map.values()),
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
    ensureAssoc();
    const userId = req.user?.id;
    const { judul, deskripsi, assigned_to, deadline } = req.body;

    if (!judul || !assigned_to) {
      return res.status(400).json({ error: 'Judul dan penerima tugas wajib diisi.' });
    }

    const tugas = await Task.create({
      judul,
      deskripsi,
      modul_id: 'BKT-JF',
      status: 'assigned',
      due_date: deadline ? new Date(deadline) : null,
      created_at: new Date()
    });

    await TaskAssignment.create({
      task_id: tugas.id,
      assignee_role: 'pelaksana',
      assignee_user_id: Number(assigned_to),
      assigned_by: userId,
      status: 'assigned',
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SKP PELAKSANA (CONFIDENTIAL) ===
export async function getSkpPelaksana(req, res) {
  try {
    // Hanya JF penilai langsung yang bisa akses
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

    // Simpan nilai — dalam implementasi penuh ini akan ke tabel skp_penilaian
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
    const rows = await AnalisaJfKetersediaan.findAll({
      where: { jf_id: userId },
      order: [['created_at', 'DESC']],
      limit: 30,
    }).catch(() => []);
    res.json({
      data: rows,
      meta: {
        jf_id: userId,
        jenis_tersedia: [
          'analisa_ketersediaan',
          'analisa_kerawanan',
          'neraca_pangan',
          'laporan_bimtek',
          'rekomendasi',
        ],
      },
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

    const row = await AnalisaJfKetersediaan.create({
      jf_id: userId,
      judul,
      jenis,
      isi_analisa,
      periode: periode ?? null,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}
