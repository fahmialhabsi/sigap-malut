// backend/controllers/pelaksana/tugasSayaController.js
// TUGAS SAYA — Pusat operasional Pelaksana (BAGIAN E.1)
// List, accept, start, submit, revisi, sub-checklist CRUD

import { Op } from 'sequelize';
import Task from '../../../models/Task.js';
import TaskAssignment from '../../../models/TaskAssignment.js';
import TaskLog from '../../../models/TaskLog.js';
import SubChecklistTugas from '../../../models/SubChecklistTugas.js';
import Notification from '../../../models/Notification.js';
import { pelaksanaRoleGuard, tugasSayaGuard, submitTugasGuard } from '../../../middleware/pelaksanaRoleGuard.js';
import sequelize from '../../../config/database.js';

const userId = (req) => req.user.id;
const role = (req) => req.user.role;

// ── GET /api/pelaksana/tugas — List Tugas Saya (filter status, hari/minggu) ──
export const getTugasSaya = async (req, res) => {
  try {
    const uid = userId(req);
    const { status, periode = 'semua', limit = 50 } = req.query;
    
    const where = {
      deleted_at: null,
      status: status ? status.split(',') : undefined
    };

    if (periode === 'hari-ini') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.due_date = { [Op.between]: [today, tomorrow] };
    } else if (periode === 'minggu-ini') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      where.due_date = { [Op.between]: [weekStart, weekEnd] };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: TaskAssignment,
          where: { assignee_user_id: uid }, // Hanya tugas saya
          required: true,
          include: [{
            model: User, 
            as: 'assignee', 
            attributes: ['nama_lengkap']
          }]
        },
        {
          model: TaskLog, 
          as: 'logs', 
          limit: 3,
          order: [['created_at', 'DESC']]
        },
        {
          model: TaskFile,
          as: 'files',
          attributes: ['id', 'file_name', 'file_type']
        },
        {
          model: SubChecklistTugas,
          as: 'subChecklist',
          attributes: ['id', 'deskripsi', 'is_selesai', 'urutan']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit: Number(limit)
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/tugas/:id/terima — Accept tugas ──
export const terimaTugas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    const uid = userId(req);
    
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task || task.status !== 'assigned') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Tugas tidak assigned atau sudah diterima' });
    }

    // Update task status + assignment
    task.status = 'accepted';
    await task.save({ transaction: t });

    await TaskAssignment.update(
      { status: 'accepted', accepted_at: new Date() },
      { where: { task_id: taskId, assignee_user_id: uid }, transaction: t }
    );

    await TaskLog.create({
      task_id: taskId,
      actor_id: uid,
      action: 'TERIMA_TUGAS'
    }, { transaction: t });

    await t.commit();

    // Notif ke pembuat tugas
    await Notification.create({
      target_user_id: task.created_by,
      task_id: taskId,
      message: `Tugas "${task.title}" diterima oleh ${role(req)}`
    });

    res.json({ success: true, data: task });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/tugas/:id/mulai — Start pengerjaan ──
export const mulaiTugas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    const uid = userId(req);
    
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task || task.status !== 'accepted') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Tugas belum diterima' });
    }

    task.status = 'in_progress';
    task.started_at = new Date();
    await task.save({ transaction: t });

    await TaskLog.create({
      task_id: taskId,
      actor_id: uid,
      action: 'MULAI_TUGAS'
    }, { transaction: t });

    await t.commit();

    res.json({ success: true, data: task });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/tugas/:id/submit — Submit hasil + upload bukti ──
export const submitTugas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const taskId = req.params.id;
    const uid = userId(req);
    const { note, bukti_files } = req.body; // files via multer separate endpoint

    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task || !['in_progress'].includes(task.status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Tugas belum siap disubmit' });
    }

    // Hierarchy guard sudah di middleware
    task.status = 'submitted';
    task.submitted_at = new Date();
    task.submitted_note = note;
    await task.save({ transaction: t });

    await TaskAssignment.update(
      { status: 'submitted' },
      { where: { task_id: taskId, assignee_user_id: uid }, transaction: t }
    );

    await TaskLog.create({
      task_id: taskId,
      actor_id: uid,
      action: 'SUBMIT_TUGAS',
      note: note || null
    }, { transaction: t });

    await t.commit();

    // Notif ke atasan (req.atasanLangsung dari middleware)
    const atasanId = req.atasanLangsung?.atasan_id;
    if (atasanId) {
      await Notification.create({
        target_user_id: atasanId,
        task_id: taskId,
        message: `Tugas "${task.title}" disubmit oleh Pelaksana untuk diverifikasi`
      });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/tugas/:id/revisi — Submit ulang setelah dikembalikan ──
export const revisiTugas = async (req, res) => {
  // Sama seperti submit, tapi log 'REVISI_TUGAS' + increment revisi counter
  res.json({ success: true, message: 'Revisi endpoint (reuse submit logic + counter)' });
};

// ── Sub-checklist CRUD (alat bantu pribadi) ──
export const getChecklist = async (req, res) => {
  try {
    const checklists = await SubChecklistTugas.findAll({
      where: { 
        task_id: req.params.id,
        dibuat_oleh: userId(req)
      },
      order: [['urutan', 'ASC']]
    });
    res.json({ success: true, data: checklists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createChecklistItem = async (req, res) => {
  try {
    const { deskripsi } = req.body;
    const maxUrutan = await SubChecklistTugas.max('urutan', {
      where: { task_id: req.params.id, dibuat_oleh: userId(req) }
    }) || 0;

    const item = await SubChecklistTugas.create({
      task_id: req.params.id,
      dibuat_oleh: userId(req),
      deskripsi,
      urutan: maxUrutan + 1
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleChecklistItem = async (req, res) => {
  try {
    const item = await SubChecklistTugas.findByPk(req.params.itemId);
    if (!item || item.dibuat_oleh !== userId(req)) {
      return res.status(404).json({ success: false, message: 'Checklist tidak ditemukan' });
    }

    item.is_selesai = !item.is_selesai;
    if (item.is_selesai) {
      item.selesai_at = new Date();
    } else {
      item.selesai_at = null;
    }
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteChecklistItem = async (req, res) => {
  try {
    const item = await SubChecklistTugas.findOne({
      where: {
        id: req.params.itemId,
        dibuat_oleh: userId(req)
      }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist tidak ditemukan' });
    }

    await item.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

