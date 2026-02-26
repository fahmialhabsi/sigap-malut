// Fungsi approve untuk approval multi-level
export function approve(doc, level) {
  doc.approvals[level] = true;
  return doc;
}

// Fungsi transition untuk workflow state
export function transition(from, to) {
  if (from === "draft" && to === "submitted") return "submitted";
  throw new Error("invalid transition");
}
class WorkflowService {
  // Get workflow path for a module
  getWorkflowPath(unitKerja, modulId) {
    const workflows = {
      Sekretariat: {
        default: ["pelaksana", "kasubbag", "sekretaris", "kepala_dinas"],
        levels: 4,
      },
      UPTD: {
        default: [
          "pelaksana",
          "kasi_uptd",
          "kepala_uptd",
          "sekretaris",
          "kepala_dinas",
        ],
        levels: 5,
      },
      "Bidang Ketersediaan": {
        default: [
          "pelaksana",
          "fungsional",
          "kepala_bidang",
          "sekretaris",
          "kepala_dinas",
        ],
        levels: 5,
      },
      "Bidang Distribusi": {
        default: [
          "pelaksana",
          "fungsional",
          "kepala_bidang",
          "sekretaris",
          "kepala_dinas",
        ],
        levels: 5,
      },
      "Bidang Konsumsi": {
        default: [
          "pelaksana",
          "fungsional",
          "kepala_bidang",
          "sekretaris",
          "kepala_dinas",
        ],
        levels: 5,
      },
    };

    return workflows[unitKerja] || workflows["Sekretariat"];
  }

  // Get next approver
  getNextApprover(currentRole, unitKerja) {
    const workflow = this.getWorkflowPath(unitKerja);
    const currentIndex = workflow.default.indexOf(currentRole);

    if (currentIndex === -1 || currentIndex === workflow.default.length - 1) {
      return null;
    }

    return workflow.default[currentIndex + 1];
  }

  // Check if can approve
  canApprove(userRole, documentStatus, unitKerja) {
    const workflow = this.getWorkflowPath(unitKerja);
    const requiredRole = this.getRequiredRoleForStatus(documentStatus);

    return (
      workflow.default.includes(userRole) &&
      workflow.default.indexOf(userRole) >=
        workflow.default.indexOf(requiredRole)
    );
  }

  // Get required role for status
  getRequiredRoleForStatus(status) {
    const statusRoleMap = {
      draft: "pelaksana",
      pending: "kasubbag", // or kasi_uptd or fungsional
      review: "kepala_bidang", // or kepala_uptd or sekretaris
      approved: "sekretaris",
      final: "kepala_dinas",
    };

    return statusRoleMap[status] || "pelaksana";
  }

  // Create workflow instance
  async createWorkflow(data) {
    // Save to approval_workflow table
    const { default: ApprovalWorkflow } =
      await import("../models/approvalWorkflow.js");
    const workflow = await ApprovalWorkflow.create({
      modul_id: data.modul_id,
      record_id: data.record_id,
      unit_kerja: data.unit_kerja,
      current_level: 1,
      total_levels: this.getWorkflowPath(data.unit_kerja).levels,
      current_role: "pelaksana",
      next_role: this.getNextApprover("pelaksana", data.unit_kerja),
      status: "pending",
      submitted_by: data.user_id,
      submitted_at: new Date(),
    });
    return workflow;
  }

  // Log approval action
  async logApproval(workflowId, data) {
    // Save to approval_log table
    const { default: ApprovalLog } = await import("../models/approvalLog.js");
    const log = await ApprovalLog.create({
      workflow_id: workflowId,
      approver_id: data.user_id,
      approver_role: data.user_role,
      approval_level: data.level,
      action: data.action, // 'approve', 'reject', 'bypass'
      notes: data.notes,
      created_at: new Date(),
    });
    return log;
  }

  // Detect and log bypass
  async detectBypass(data) {
    // Save to bypass_detection table
    const { default: BypassDetection } =
      await import("../models/bypassDetection.js");
    const bypass = await BypassDetection.create({
      workflow_id: data.workflow_id,
      user_id: data.user_id,
      user_role: data.user_role,
      bypassed_level: data.bypassed_level,
      attempted_action: data.attempted_action,
      detected_at: new Date(),
      severity: data.severity || "high",
    });
    await this.sendBypassAlert(bypass);
    return bypass;
  }

  // Send bypass alert
  async sendBypassAlert(bypass) {
    console.log("📧 Sending bypass alert to Sekretaris and Kepala Dinas");
    // Implementasi notifikasi email/WhatsApp
    let emailService;
    let whatsappService;
    try {
      ({ default: emailService } = await import("../utils/emailService.js"));
    } catch (e) {
      emailService = {
        sendEmail: () => console.warn("emailService not available"),
      };
    }
    try {
      ({ default: whatsappService } =
        await import("../utils/whatsappService.js"));
    } catch (e) {
      whatsappService = {
        sendMessage: () => console.warn("whatsappService not available"),
      };
    }
    const recipients = [bypass.sekretarisEmail, bypass.kepalaDinasEmail];
    const subject = `ALERT: BYPASS KOORDINASI oleh ${bypass.namaStaf}`;
    const message = `BYPASS terdeteksi pada workflow: ${bypass.workflowId}\n\nDetail:\n${JSON.stringify(bypass, null, 2)}`;
    // Kirim email
    recipients.forEach((email) => {
      emailService.sendEmail(email, subject, message);
    });
    // Kirim WhatsApp
    recipients.forEach((phone) => {
      whatsappService.sendMessage(phone, message);
    });
  }

  // Get workflow statistics
  async getWorkflowStats(unitKerja, period = "30d") {
    // TODO: Query from database
    return {
      total_workflows: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      bypass_detected: 0,
      avg_approval_time: 0,
    };
  }
}

export default new WorkflowService();
