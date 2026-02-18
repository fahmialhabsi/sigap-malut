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
    // TODO: Save to approval_workflow table
    const workflow = {
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
    };

    console.log("Workflow created:", workflow);
    return workflow;
  }

  // Log approval action
  async logApproval(workflowId, data) {
    // TODO: Save to approval_log table
    const log = {
      workflow_id: workflowId,
      approver_id: data.user_id,
      approver_role: data.user_role,
      approval_level: data.level,
      action: data.action, // 'approve', 'reject', 'bypass'
      notes: data.notes,
      created_at: new Date(),
    };

    console.log("Approval logged:", log);
    return log;
  }

  // Detect and log bypass
  async detectBypass(data) {
    // TODO: Save to bypass_detection table
    const bypass = {
      workflow_id: data.workflow_id,
      user_id: data.user_id,
      user_role: data.user_role,
      bypassed_level: data.bypassed_level,
      attempted_action: data.attempted_action,
      detected_at: new Date(),
      severity: data.severity || "high",
    };

    console.error("🚨 BYPASS DETECTED:", bypass);

    // TODO: Send alert
    await this.sendBypassAlert(bypass);

    return bypass;
  }

  // Send bypass alert
  async sendBypassAlert(bypass) {
    console.log("📧 Sending bypass alert to Sekretaris and Kepala Dinas");
    // TODO: Implement email/WhatsApp notification
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
