// Mock export enforce untuk test compliance & audit
export function enforce(workflow) {
  // Simulasi compliance dan alert
  return {
    compliant: true,
    alerts: ["No issues"],
    workflow,
  };
}
import { getRoleLevel } from "./roleCheck.js";

// @desc    Enforce workflow - cannot skip levels
// @usage   router.post('/submit', protect, enforceWorkflow, controller)
export const enforceWorkflow = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  const { submit_to, bypass_reason } = req.body;

  // Super admin bisa bypass (tapi harus ada alasan)
  if (req.user.role === "super_admin") {
    if (submit_to && !bypass_reason) {
      return res.status(400).json({
        success: false,
        message: "Super admin harus memberikan alasan jika bypass workflow",
      });
    }
    return next();
  }

  // Get workflow rules based on unit_kerja
  const workflowRules = getWorkflowRules(req.user.unit_kerja);

  // Validate submission path
  const currentLevel = getRoleLevel(req.user.role);
  const targetLevel = getRoleLevel(submit_to);

  // Check if trying to skip levels
  if (targetLevel > currentLevel + 1) {
    // Detect bypass attempt
    await logBypass({
      user_id: req.user.id,
      user_role: req.user.role,
      attempted_submit_to: submit_to,
      current_level: currentLevel,
      target_level: targetLevel,
      unit_kerja: req.user.unit_kerja,
    });

    return res.status(403).json({
      success: false,
      message: `Tidak dapat melewati level approval. Dokumen harus melalui ${workflowRules.next_level[req.user.role]} terlebih dahulu.`,
      workflow_path: workflowRules.path,
    });
  }

  next();
};

// @desc    Workflow rules per unit
// ROLE NORMALIZATION — DB canonical = kasubag_umum_kepegawaian (1 b).
// Legacy kasubbag (2 b) dipertahankan sebagai alias untuk backward compat.
// Referensi: 55-terminology-canonical.md, 33-keputusan-arsitektur-final.
function getWorkflowRules(unit_kerja) {
  const rules = {
    Sekretariat: {
      path: "Pelaksana → Kasubag Umum & Kepeg. → Sekretaris → Kepala Dinas",
      next_level: {
        pelaksana: "Kasubag",
        pelaksana_sekretariat: "Kasubag",
        kasubag_umum_kepegawaian: "Sekretaris", // canonical DB (1 b)
        kasubbag: "Sekretaris",                  // legacy alias (2 b)
        kasubbag_umum: "Sekretaris",             // legacy alias
        kasubbag_kepegawaian: "Sekretaris",      // legacy alias
        kasubbag_perencanaan: "Sekretaris",      // legacy alias
        sekretaris: "Kepala Dinas",
      },
      mandatory_levels: ["kasubag_umum_kepegawaian", "sekretaris"],
    },
    UPTD: {
      path: "Pelaksana → Kasi/Kasubag TU → Kepala UPTD → Sekretaris → Kepala Dinas",
      next_level: {
        pelaksana: "Kepala Seksi UPTD",
        kepala_seksi_uptd: "Kepala UPTD",  // canonical DB
        kasubag_uptd: "Kepala UPTD",        // canonical DB
        kasi_mutu: "Kepala UPTD",           // canonical DB
        kasi_teknis: "Kepala UPTD",         // canonical DB
        kasubbag_tu_uptd: "Kepala UPTD",   // legacy alias
        kasi_mutu_uptd: "Kepala UPTD",     // legacy alias
        kasi_teknis_uptd: "Kepala UPTD",   // legacy alias
        kepala_uptd: "Sekretaris",
        sekretaris: "Kepala Dinas",
      },
      mandatory_levels: ["kepala_seksi_uptd", "kepala_uptd", "sekretaris"],
    },
    "Bidang Ketersediaan": {
      path: "Pelaksana → Pejabat Fungsional → Kepala Bidang Ketersediaan → Sekretaris → Kepala Dinas",
      next_level: {
        pelaksana: "Pejabat Fungsional",
        pejabat_fungsional: "Kepala Bidang",  // canonical DB
        fungsional: "Kepala Bidang",           // legacy alias
        fungsional_analis: "Kepala Bidang",    // legacy alias
        kepala_bidang_ketersediaan: "Sekretaris", // canonical DB
        kepala_bidang: "Sekretaris",           // generic alias
        sekretaris: "Kepala Dinas",
      },
      mandatory_levels: ["pejabat_fungsional", "kepala_bidang_ketersediaan", "sekretaris"],
    },
    "Bidang Distribusi": {
      path: "Pelaksana → Pejabat Fungsional → Kepala Bidang Distribusi → Sekretaris → Kepala Dinas",
      next_level: {
        pelaksana: "Pejabat Fungsional",
        pejabat_fungsional: "Kepala Bidang",
        fungsional: "Kepala Bidang",
        fungsional_analis: "Kepala Bidang",
        kepala_bidang_distribusi: "Sekretaris", // canonical DB
        kepala_bidang: "Sekretaris",
        sekretaris: "Kepala Dinas",
      },
      mandatory_levels: ["pejabat_fungsional", "kepala_bidang_distribusi", "sekretaris"],
    },
    "Bidang Konsumsi": {
      path: "Pelaksana → Pejabat Fungsional → Kepala Bidang Konsumsi → Sekretaris → Kepala Dinas",
      next_level: {
        pelaksana: "Pejabat Fungsional",
        pejabat_fungsional: "Kepala Bidang",
        fungsional: "Kepala Bidang",
        fungsional_analis: "Kepala Bidang",
        kepala_bidang_konsumsi: "Sekretaris", // canonical DB
        kepala_bidang: "Sekretaris",
        sekretaris: "Kepala Dinas",
      },
      mandatory_levels: ["pejabat_fungsional", "kepala_bidang_konsumsi", "sekretaris"],
    },
  };

  return rules[unit_kerja] || rules["Sekretariat"];
}

// @desc    Check if trying to bypass Sekretaris (CRITICAL!)
export const enforceSekretarisGateway = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  const { submit_to } = req.body;

  // Super admin dan Sekretaris sendiri bisa bypass
  if (["super_admin", "sekretaris"].includes(req.user.role)) {
    return next();
  }

  // Kepala Bidang atau Kepala UPTD tidak boleh langsung ke Kepala Dinas
  if (
    ["kepala_bidang", "kepala_uptd", "kepala_bidang_ketersediaan",
     "kepala_bidang_distribusi", "kepala_bidang_konsumsi"].includes(req.user.role) &&
    submit_to === "kepala_dinas"
  ) {
    // Log critical bypass attempt
    logBypass({
      user_id: req.user.id,
      user_role: req.user.role,
      attempted_submit_to: submit_to,
      severity: "CRITICAL",
      bypassed_level: "sekretaris",
      alert_to: ["sekretaris@dinpangan.go.id", "kepala_dinas@dinpangan.go.id"],
    });

    return res.status(403).json({
      success: false,
      message:
        "WAJIB melalui Sekretaris terlebih dahulu sebelum ke Kepala Dinas!",
      required_path: "Kepala Bidang/UPTD → Sekretaris → Kepala Dinas",
    });
  }

  next();
};

// @desc    Log bypass attempts
async function logBypass(data) {
  // TODO: Save to bypass_detection table
  console.error("🚨 BYPASS DETECTED:", {
    timestamp: new Date().toISOString(),
    ...data,
  });

  // TODO: Send alert email/notification
  // await sendBypassAlert(data);
}

// @desc    Check if user can modify record (owner check)
export const checkOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  // Super admin, kepala dinas, sekretaris bisa edit semua
  if (["super_admin", "kepala_dinas", "sekretaris"].includes(req.user.role)) {
    return next();
  }

  // TODO: Check if record.created_by === req.user.id
  // Or record.unit_kerja === req.user.unit_kerja

  next();
};

// @desc    Validate workflow status transition
export const validateStatusTransition = (req, res, next) => {
  const { status, current_status } = req.body;

  if (!status) {
    return next();
  }

  const validTransitions = {
    draft: ["pending", "cancelled"],
    pending: ["proses", "rejected", "cancelled"],
    proses: ["review", "rejected", "cancelled"],
    review: ["approved", "rejected", "revision"],
    revision: ["pending", "cancelled"],
    approved: ["completed"],
    rejected: ["revision", "cancelled"],
    completed: [],
    cancelled: [],
  };

  if (current_status && validTransitions[current_status]) {
    if (!validTransitions[current_status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat mengubah status dari '${current_status}' ke '${status}'. Transisi yang valid: ${validTransitions[current_status].join(", ")}`,
      });
    }
  }

  next();
};

// @desc    Auto-set unit_kerja based on user
export const autoSetUnitKerja = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Jika user bukan super admin, auto-set unit_kerja
  if (req.user.role !== "super_admin") {
    req.body.unit_kerja = req.user.unit_kerja;
  }

  next();
};

// @desc    Auto-set created_by
export const autoSetCreatedBy = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  req.body.created_by = req.user.id;

  next();
};
