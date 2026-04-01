import ApprovalOrchestrationService from "../../services/approvalOrchestrationService.js";
import ApprovalSekretariat from "../../models/ApprovalSekretariat.js";
import User from "../../models/User.js";
import Task from "../../models/Task.js";
import { Op } from "sequelize";

// ================= LIST / QUEUE =================
export const getApprovalQueue = async (req, res) => {
  try {
    const { tab, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const baseWhere = {
      status: {
        [Op.or]: ["menunggu_persetujuan_sekretaris", "dikembalikan_sekretaris"],
      },
    };

    if (tab && tab !== "all") {
      const tabFilters = {
        kasubag: ["kasubag_umum_kepeg"],
        jf_perencanaan: ["jf_perencanaan"],
        jf_keuangan: ["jf_keuangan"],
        bendahara: [
          "bendahara_pengeluaran",
          "bendahara_gaji",
          "bendahara_barang",
        ],
        bidang_uptd: [
          "bidang_ketersediaan",
          "bidang_distribusi",
          "bidang_konsumsi",
          "uptd",
        ],
      };

      baseWhere.asal_unit = { [Op.in]: tabFilters[tab] || [] };
    }

    const approvals = await ApprovalSekretariat.findAndCountAll({
      where: baseWhere,
      include: [{ model: User, as: "submittedBy" }, { model: Task }],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: approvals.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: approvals.count,
        pages: Math.ceil(approvals.count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DETAIL =================
export const getApprovalDetail = async (req, res) => {
  try {
    const approval = await ApprovalSekretariat.findByPk(req.params.id, {
      include: [
        { model: User, as: "submittedBy" },
        { model: User, as: "verifikasiOlehKasubag" },
        { model: User, as: "analisaOlehJf" },
        { model: User, as: "diputuskanOleh" },
        { model: Task },
      ],
    });

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval not found",
      });
    }

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= PUTUSKAN =================
export const putuskanApproval = async (req, res) => {
  try {
    const { keputusan, catatan } = req.body;

    const approval = await ApprovalOrchestrationService.putuskanSekretaris(
      req.params.id,
      req.user,
      keputusan,
      catatan,
    );

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= TERUSKAN =================
export const teruskanKeKadin = async (req, res) => {
  try {
    const approval = await ApprovalOrchestrationService.teruskanKeKadin(
      req.params.id,
      req.user,
    );

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
