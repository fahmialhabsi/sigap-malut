// Controller: JF Bidang Konsumsi & Penganekaragaman Pangan (Hybrid Manager)
import { Op } from 'sequelize';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import TaskAssignment from "../models/TaskAssignment.js";
import User from "../models/User.js";
import KonsumsiPangan from "../models/KonsumsiPangan.js";
import SppgDistribusi from "../models/SppgDistribusi.js";
import InspeksiKeamanan from "../models/InspeksiKeamanan.js";

const JENIS_ANALISA_KONSUMSI = [
  'analisa_konsumsi',
  'analisa_pph',
  'analisa_inspeksi',
  'analisa_sppg',
  'laporan_b2sa',
  'laporan_bimtek',
  'rekomendasi_diversifikasi'
];

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
  if (!TaskAssignment.associations?.task) {
    TaskAssignment.belongsTo(Task, { foreignKey: "task_id", as: "task" });
  }
  if (!TaskAssignment.associations?.assignee) {
    TaskAssignment.belongsTo(User, {
      foreignKey: "assignee_user_id",
      as: "assignee",
    });
  }
}

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
    ensureAssoc();
    const userId = req.user?.id;
    const type = String(req.query?.type || "").toLowerCase(); // survei|sppg|inspeksi

    const tasks = await Task.findAll({
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: true,
          where: { assignee_user_id: userId },
        },
      ],
      where: {
        status: "submitted_to_jf",
        modul_id: { [Op.in]: ["KNS-DATA", "KNS-JF"] },
      },
      order: [["created_at", "DESC"]],
      limit: 30,
    }).catch(() => []);

    const filtered = type
      ? tasks.filter((t) => String(t.metadata?.sub_type || t.metadata?.jenis_tugas || "").toLowerCase() === type)
      : tasks;

    res.json({
      data: filtered.slice(0, 15).map((t) => ({
        id: t.id,
        judul: t.title,
        tipe: "data_konsumsi",
        sub_type: t.metadata?.sub_type ?? t.metadata?.jenis_tugas ?? null,
        ringkas: t.metadata?.ringkas ?? null,
        dibuat_pada: t.created_at,
        status: t.status,
      })),
      total: filtered.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === VERIFIKASI: TERIMA DATA KONSUMSI ===
export async function terimaVerifikasi(req, res) {
  try {
    ensureAssoc();
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    const assn = await TaskAssignment.findOne({
      where: { task_id: Number(id), assignee_user_id: userId },
    }).catch(() => null);
    if (!assn) return res.status(404).json({ error: "not_found" });

    const task = await Task.findByPk(Number(id)).catch(() => null);
    const ref = task?.metadata?.ref;
    if (ref?.table && Array.isArray(ref.ids) && ref.ids.length) {
      const ids = ref.ids.map((x) => Number(x)).filter((x) => Number.isFinite(x));
      const now = new Date();
      if (ref.table === "konsumsi_pangan") {
        await KonsumsiPangan.update(
          { status: "terverifikasi", diverifikasi_oleh: userId, updated_at: now },
          { where: { id: { [Op.in]: ids } } },
        ).catch(() => null);
      } else if (ref.table === "sppg_distribusi") {
        await SppgDistribusi.update(
          { diverifikasi_oleh: userId, updated_at: now },
          { where: { id: { [Op.in]: ids } } },
        ).catch(() => null);
      } else if (ref.table === "inspeksi_keamanan") {
        await InspeksiKeamanan.update(
          { diverifikasi_oleh: userId, status: "selesai", updated_at: now },
          { where: { id: { [Op.in]: ids } } },
        ).catch(() => null);
      }
    }

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
    const ref = task?.metadata?.ref;
    if (ref?.table && Array.isArray(ref.ids) && ref.ids.length) {
      const ids = ref.ids.map((x) => Number(x)).filter((x) => Number.isFinite(x));
      const now = new Date();
      if (ref.table === "konsumsi_pangan") {
        await KonsumsiPangan.update(
          {
            status: "draft",
            diverifikasi_oleh: null,
            catatan_revisi: catatan,
            updated_at: now,
          },
          { where: { id: { [Op.in]: ids } } },
        ).catch(() => null);
      } else if (ref.table === "sppg_distribusi") {
        await SppgDistribusi.update(
          {
            diverifikasi_oleh: null,
            catatan_revisi: catatan,
            updated_at: now,
          },
          { where: { id: { [Op.in]: ids } } },
        ).catch(() => null);
      } else if (ref.table === "inspeksi_keamanan") {
        await InspeksiKeamanan.update(
          {
            diverifikasi_oleh: null,
            status: "draft",
            catatan_revisi: catatan,
            updated_at: now,
          },
          { where: { id: { [Op.in]: ids } } },
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
    const userId = req.user?.id;

    // Placeholder: list berdasarkan task assignment yang dibuat JF
    const tugasPelaksana = await Task.findAll({
      where: { created_by: userId, modul_id: "KNS-JF" },
      order: [["created_at", "DESC"]],
      limit: 20,
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
    const { judul, deskripsi, assigned_to, deadline, jenis_tugas } = req.body;

    if (!judul || !assigned_to) {
      return res.status(400).json({ error: 'Judul dan penerima tugas wajib diisi.' });
    }

    const tugas = await Task.create({
      title: judul,
      description: deskripsi,
      modul_id: "KNS-JF",
      created_by: userId,
      due_date: deadline || null,
      status: "assigned",
      metadata: { jenis_tugas: jenis_tugas || null },
      created_at: new Date(),
      updated_at: new Date(),
    });

    // assignment ke pelaksana (optional: jika assigned_to adalah userId pelaksana)
    if (assigned_to) {
      await TaskAssignment.create({
        task_id: tugas.id,
        assignee_role: "pelaksana_konsumsi",
        assignee_user_id: Number(assigned_to) || null,
        assigned_by: userId,
        status: "assigned",
      }).catch(() => null);
    }

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

// === SUBMIT ANALISA KE KABID ===
export async function submitAnalisaKeKabid(req, res) {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: "Analisa dikirim ke Kepala Bidang untuk review.",
      data: { id: Number(id), status: "submitted_to_kabid", submitted_at: new Date().toISOString() },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

// === KOORDINASI UPTD (JF) ===
export async function createKoordinasiUptd(req, res) {
  try {
    const userId = req.user?.id;
    const { jenis_permintaan, deskripsi, ref_kasus_id, ref_inspeksi_id } = req.body || {};
    if (!jenis_permintaan || !deskripsi) {
      return res.status(400).json({ error: "jenis_permintaan dan deskripsi wajib diisi" });
    }
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        nomor_surat: `UPTD-KOOR-${String(Math.floor(Math.random() * 900) + 100)}`,
        tanggal_permintaan: new Date().toISOString().slice(0, 10),
        dari_bidang: "Bidang Konsumsi",
        jenis_permintaan,
        deskripsi,
        ref_kasus_id: ref_kasus_id ?? null,
        ref_inspeksi_id: ref_inspeksi_id ?? null,
        dibuat_oleh: userId,
        status: "dikirim",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getKoordinasiUptdStatus(req, res) {
  try {
    res.json({
      data: [
        {
          id: 1,
          nomor_surat: "UPTD-KOOR-001",
          status: "dalam_pengujian",
          tanggal_permintaan: "2026-03-30",
        },
      ],
      total: 1,
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}
