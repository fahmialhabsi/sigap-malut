import ApprovalSekretariat from "../models/ApprovalSekretariat.js";
import NotifikasiSekretaris from "../models/NotifikasiSekretaris.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import { EVENTS, ROOMS, getIO } from "./socketService.js";
import { Op } from "sequelize";

/**
 * Helper emit biar aman (hindari io null)
 */
const emit = (room, event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to(room).emit(event, payload);
};

/**
 * Core orchestration service for Sekretaris approval workflow
 */
class ApprovalOrchestrationService {
  static async submitDokumen(data, user) {
    const { nomor_dokumen, judul, jenis, asal_unit, lampiran_url, task_id } =
      data;

    const approval = await ApprovalSekretariat.create({
      nomor_dokumen,
      judul,
      jenis,
      asal_unit,
      submitted_by: user.id,
      lampiran_url,
      task_id,
      status: "draft",
    });

    await this.transitionToKasubag(approval.id, user);

    return approval;
  }

  static async transitionToKasubag(approvalId, user) {
    const approval = await ApprovalSekretariat.findByPk(approvalId);
    if (!approval) throw new Error("Approval not found");

    approval.status = "menunggu_verifikasi_kasubag";
    await approval.save();

    await this.sendNotifikasi(approval, "approval_masuk_kasubag", user.id);

    emit(ROOMS.KASUBAG, EVENTS.ALERT_NEW, {
      type: "approval_queue",
      approvalId,
    });
  }

  static async approveKasubag(approvalId, user, catatan = null) {
    const approval = await ApprovalSekretariat.findByPk(approvalId);
    if (!approval) throw new Error("Approval not found");

    approval.diverifikasi_kasubag = true;
    approval.verifikasi_oleh_kasubag = user.id;
    approval.verifikasi_kasubag_at = new Date();
    approval.catatan_kasubag = catatan;

    if (approval.perlu_analisa_jf) {
      approval.status = "menunggu_analisa_jf";
      await approval.save();

      await this.sendNotifikasi(approval, "approval_masuk_jf", user.id);

      emit(ROOMS.JF, EVENTS.ALERT_NEW, {
        type: "approval_jf",
        approvalId,
      });
    } else {
      approval.status = "menunggu_persetujuan_sekretaris";
      await approval.save();

      await this.sendNotifikasi(approval, "approval_masuk_sekretaris", user.id);

      emit(ROOMS.SEKRETARIS, EVENTS.ALERT_NEW, {
        type: "approval_queue",
        approvalId,
      });
    }
  }

  static async putuskanSekretaris(approvalId, user, keputusan, catatan = null) {
    const approval = await ApprovalSekretariat.findByPk(approvalId);
    if (!approval) throw new Error("Approval not found");

    approval.status = keputusan;
    approval.catatan_sekretaris = catatan;
    approval.diputuskan_oleh = user.id;
    approval.diputuskan_at = new Date();

    if (keputusan === "dikembalikan_sekretaris") {
      approval.revisi_ke = (approval.revisi_ke || 0) + 1;
    }

    await approval.save();

    await this.sendNotifikasi(approval, `status_${keputusan}`, user.id);

    emit(ROOMS.ALERTS, EVENTS.ALERT_NEW, {
      type: "approval_update",
      approvalId,
      status: keputusan,
    });

    return approval;
  }

  static async teruskanKeKadin(approvalId, user) {
    const approval = await ApprovalSekretariat.findByPk(approvalId);
    if (!approval) throw new Error("Approval not found");

    approval.status = "diteruskan_ke_kadin";
    await approval.save();

    emit(ROOMS.KADIN, EVENTS.ALERT_NEW, {
      type: "approval_from_sekretaris",
      approvalId,
    });

    return approval;
  }

  static async sendNotifikasi(approval, jenis, senderId = null) {
    await NotifikasiSekretaris.create({
      user_id: approval.submitted_by,
      jenis,
      judul: `Approval: ${approval.judul}`,
      isi: `Status: ${approval.status}`,
      referensi_id: approval.id,
      referensi_tabel: "approval_sekretariat",
      created_by: senderId,
    });
  }

  static async getQueueForSekretaris() {
    return ApprovalSekretariat.findAll({
      where: {
        status: "menunggu_persetujuan_sekretaris",
      },
      include: [{ model: User, as: "submittedBy" }, { model: Task }],
      order: [["created_at", "DESC"]],
    });
  }

  static async getApprovalQueue(tab = null) {
    const where = {
      status: "menunggu_persetujuan_sekretaris",
    };

    if (tab) {
      const tabMap = {
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

      where.asal_unit = {
        [Op.in]: tabMap[tab],
      };
    }

    return ApprovalSekretariat.findAll({
      where,
      include: [{ model: User, as: "submittedBy" }],
    });
  }
}

export default ApprovalOrchestrationService;
