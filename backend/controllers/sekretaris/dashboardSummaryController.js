import { sequelize } from "../../config/database.js";
import ApprovalSekretariat from "../../models/ApprovalSekretariat.js";
import NotifikasiSekretaris from "../../models/NotifikasiSekretaris.js";
import Task from "../../models/Task.js";
import { Op, QueryTypes } from "sequelize";

/**
 * @desc Get dashboard summary (Hero KPI)
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    const [inboxKadin, approvalQueue, unreadNotif, slaResult] =
      await Promise.all([
        // 📌 Task dari KaDin ke Sekretaris
        Task.count({
          where: {
            assigned_to_role: "sekretaris",
            status: {
              [Op.in]: ["assigned", "accepted"],
            },
          },
        }),

        // 📌 Approval pending
        ApprovalSekretariat.count({
          where: {
            status: "menunggu_persetujuan_sekretaris",
          },
        }),

        // 📌 Notifikasi belum dibaca
        NotifikasiSekretaris.count({
          where: {
            sudah_dibaca: false,
          },
        }),

        // 📌 SLA compliance (30 hari terakhir)
        sequelize.query(
          `
        SELECT 
          COALESCE(
            AVG(
              CASE 
                WHEN due_date IS NOT NULL 
                     AND updated_at <= due_date 
                THEN 100 
                ELSE 0 
              END
            ), 0
          ) AS sla_percent
        FROM tasks
        WHERE created_at >= NOW() - INTERVAL '30 days'
        `,
          { type: QueryTypes.SELECT },
        ),
      ]);

    const slaCompliance = Number(slaResult?.[0]?.sla_percent || 0);

    return res.json({
      success: true,
      data: {
        inbox_kadin: inboxKadin,
        approval_queue: approvalQueue,
        unread_notifikasi: unreadNotif,
        sla_compliance: slaCompliance,
        generated_at: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[DashboardSummary]", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard",
      error: error.message,
    });
  }
};

/**
 * @desc Get KGB alert count (30 hari ke depan)
 */
export const getKgbAlertCount = async (req, res) => {
  try {
    const result = await sequelize.query(
      `
      SELECT COUNT(*)::int as count
      FROM sek_kep
      WHERE tanggal_kgb_jatuh_tempo IS NOT NULL
        AND tanggal_kgb_jatuh_tempo <= NOW() + INTERVAL '30 days'
      `,
      { type: QueryTypes.SELECT },
    );

    return res.json({
      success: true,
      data: {
        count: Number(result?.[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("[KGB Alert]", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil KGB alert",
      error: error.message,
    });
  }
};
