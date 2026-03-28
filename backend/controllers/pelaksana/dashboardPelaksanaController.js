// backend/controllers/pelaksana/dashboardPelaksanaController.js
// Summary KPI Dashboard Pelaksana SEKRETARIAT (BAGIAN D.2 Layout)
// 4 KPI tiles + strip absensi + tugas hari ini

import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import Task from '../../models/Task.js';
import TaskAssignment from '../../models/TaskAssignment.js';
import Spj from '../../models/Spj.js'; // asumsikan exists dari migration
import AbsensiHarian from '../../models/AbsensiHarian.js'; // asumsikan exists

export const getPelaksanaSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    const [
      tugasAktif,
      tugasOverdue, 
      spjPending,
      absensiHariIni,
      tugasDikembalikan,
      standingRutinHariIni
    ] = await Promise.all([
      // Tugas aktif: assigned/accepted/in_progress untuk user ini
      Task.count({
        include: [{
          model: TaskAssignment, 
          where: { assignee_user_id: userId }
        }],
        where: {
          status: { [Op.in]: ['assigned', 'accepted', 'in_progress'] },
          deleted_at: null
        }
      }),

      // Overdue: due_date < now, bukan closed/rejected
      Task.count({
        include: [{
          model: TaskAssignment,
          where: { assignee_user_id: userId }
        }],
        where: {
          due_date: { [Op.lt]: now },
          status: { [Op.notIn]: ['closed', 'rejected', 'done'] },
          deleted_at: null
        }
      }),

      // SPJ pending: dibuat oleh user, status pending
      Spj.count({
        where: {
          dibuat_oleh: userId,
          status: { [Op.in]: ['DRAFT', 'DIAJUKAN_KE_BENDAHARA', 'MENUNGGU_VERIFIKASI'] },
          deleted_at: null
        }
      }),

      // Absensi hari ini
      AbsensiHarian.findOne({
        where: {
          user_id: userId,
          tanggal: today
        }
      }),

      // Tugas dikembalikan: status khusus atau log 'returned'
      Task.count({
        include: [{
          model: TaskAssignment,
          where: { assignee_user_id: userId }
        }],
        where: {
          status: { [Op.in]: ['returned', 'dikembalikan'] }, // atau query logs
          deleted_at: null
        }
      }),

      // Standing assignment rutin hari ini (jenis_tugas='rutin_harian')
      Task.count({
        include: [{
          model: TaskAssignment,
          where: { assignee_user_id: userId }
        }],
        where: {
          jenis_tugas: 'rutin_harian',
          due_date: { [Op.between]: [today, tomorrow] },
          status: { [Op.in]: ['assigned', 'accepted'] },
          deleted_at: null
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        // 4 KPI tiles (BAGIAN D.2)
        tugasAktif: tugasAktif,
        tugasOverdue: tugasOverdue, 
        spjPending: spjPending,
        slipGajiBulanIni: 'Tersedia', // dari Bendahara Gaji service
        
        // Strip absensi (selalu tampil atas)
        absensiHariIni: absensiHariIni || { status: null, jam: null },
        
        // Tugas hari ini untuk kanban mini
        tugasDikembalikan,
        standingRutinHariIni,
        
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal ambil summary Pelaksana',
      error: error.message
    });
  }
};

// GET /api/pelaksana/tugas/hari-ini — untuk TugasHariIniKanban panel
export const getTugasHariIni = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasks = await sequelize.query(`
      SELECT 
        t.*,
        ta.status as assignment_status,
        ta.assigned_at,
        ta.accepted_at,
        u.nama_lengkap as pembuat_nama
      FROM tasks t
      JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE ta.assignee_user_id = :userId
        AND t.due_date >= :today 
        AND t.due_date < :tomorrow
        AND t.deleted_at IS NULL
        AND t.status != 'closed'
      ORDER BY t.priority DESC, t.due_date ASC
    `, {
      replacements: { userId, today, tomorrow },
      type: sequelize.QueryTypes.SELECT,
      nest: true
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

