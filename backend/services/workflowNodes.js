// backend/services/workflowNodes.js
// A-16: Definisi graph node workflow per unit_kerja.
// Setiap node memiliki: id, label, allowedRoles (yang boleh men-trigger transisi dari node ini),
// transitions (map action → node_id berikutnya atau state terminal).
// Graph ini menggantikan array domain_sequence linear.

/**
 * NODE STRUCTURE:
 * {
 *   id: string,           // unik dalam graph
 *   label: string,        // nama tampilan
 *   allowedRoles: string[], // role yang boleh bertindak di node ini
 *   terminal: boolean,    // true = node akhir (finished/rejected)
 *   transitions: {
 *     [action: string]: string  // action → next_node_id (atau "FINISHED"/"REJECTED")
 *   }
 * }
 */

export const WORKFLOW_GRAPHS = {
  // ----------------------------------------------------------------
  // SEKRETARIAT — Pelaksana → Kasubag → Sekretaris → Kepala Dinas
  // ----------------------------------------------------------------
  Sekretariat: {
    nodes: {
      draft: {
        id: "draft",
        label: "Draft",
        allowedRoles: ["pelaksana", "staf_pelaksana", "bendahara"],
        terminal: false,
        transitions: {
          submit: "review_kasubag",
        },
      },
      review_kasubag: {
        id: "review_kasubag",
        label: "Review Kasubag",
        allowedRoles: [
          "kasubag",
          "kasubag_umum_kepegawaian",
          "kasubbag",
          "kasubbag_umum",
          "kasubbag_kepegawaian",
          "super_admin",
        ],
        terminal: false,
        transitions: {
          approve: "review_sekretaris",
          reject: "rejected",
          request_changes: "draft",
        },
      },
      review_sekretaris: {
        id: "review_sekretaris",
        label: "Review Sekretaris",
        allowedRoles: ["sekretaris", "super_admin"],
        terminal: false,
        transitions: {
          approve: "review_kadis",
          reject: "rejected",
          request_changes: "review_kasubag",
        },
      },
      review_kadis: {
        id: "review_kadis",
        label: "Final Approval Kepala Dinas",
        allowedRoles: ["kepala_dinas", "super_admin"],
        terminal: false,
        transitions: {
          approve: "finished",
          reject: "rejected",
        },
      },
      finished: {
        id: "finished",
        label: "Selesai",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
      rejected: {
        id: "rejected",
        label: "Ditolak",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
    },
    initialNode: "draft",
  },

  // ----------------------------------------------------------------
  // BIDANG (Ketersediaan / Distribusi / Konsumsi)
  // Pelaksana → JF / Kasubag → Kepala Bidang → Sekretaris → Kepala Dinas
  // ----------------------------------------------------------------
  Bidang: {
    nodes: {
      draft: {
        id: "draft",
        label: "Draft",
        allowedRoles: [
          "pelaksana",
          "staf_pelaksana",
          "jabatan_fungsional",
          "pejabat_fungsional",
        ],
        terminal: false,
        transitions: {
          submit: "review_jf",
        },
      },
      review_jf: {
        id: "review_jf",
        label: "Verifikasi Teknis JF",
        allowedRoles: [
          "jabatan_fungsional",
          "pejabat_fungsional",
          "kasubag",
          "super_admin",
        ],
        terminal: false,
        transitions: {
          approve: "review_kabid",
          reject: "rejected",
          request_changes: "draft",
        },
      },
      review_kabid: {
        id: "review_kabid",
        label: "Review Kepala Bidang",
        allowedRoles: [
          "kepala_bidang",
          "kepala_bidang_ketersediaan",
          "kepala_bidang_distribusi",
          "kepala_bidang_konsumsi",
          "super_admin",
        ],
        terminal: false,
        transitions: {
          approve: "review_sekretaris",
          reject: "rejected",
          request_changes: "review_jf",
        },
      },
      review_sekretaris: {
        id: "review_sekretaris",
        label: "Review Sekretaris",
        allowedRoles: ["sekretaris", "super_admin"],
        terminal: false,
        transitions: {
          approve: "review_kadis",
          reject: "rejected",
          request_changes: "review_kabid",
        },
      },
      review_kadis: {
        id: "review_kadis",
        label: "Final Approval Kepala Dinas",
        allowedRoles: ["kepala_dinas", "super_admin"],
        terminal: false,
        transitions: {
          approve: "finished",
          reject: "rejected",
        },
      },
      finished: {
        id: "finished",
        label: "Selesai",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
      rejected: {
        id: "rejected",
        label: "Ditolak",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
    },
    initialNode: "draft",
  },

  // ----------------------------------------------------------------
  // UPTD — Pelaksana → Kasi/Kasubag TU → Kepala UPTD → Sekretaris → Kepala Dinas
  // ----------------------------------------------------------------
  UPTD: {
    nodes: {
      draft: {
        id: "draft",
        label: "Draft",
        allowedRoles: ["pelaksana", "staf_pelaksana"],
        terminal: false,
        transitions: {
          submit: "review_kasi",
        },
      },
      review_kasi: {
        id: "review_kasi",
        label: "Verifikasi Kasi / Kasubag TU",
        allowedRoles: [
          "seksi_manajemen_mutu",
          "seksi_manajemen_teknis",
          "kasi_uptd",
          "subbag_tata_usaha",
          "kasubag_uptd",
          "super_admin",
        ],
        terminal: false,
        transitions: {
          approve: "review_kauptd",
          reject: "rejected",
          request_changes: "draft",
        },
      },
      review_kauptd: {
        id: "review_kauptd",
        label: "Review Kepala UPTD",
        allowedRoles: ["kepala_uptd", "super_admin"],
        terminal: false,
        transitions: {
          approve: "review_sekretaris",
          reject: "rejected",
          request_changes: "review_kasi",
        },
      },
      review_sekretaris: {
        id: "review_sekretaris",
        label: "Review Sekretaris",
        allowedRoles: ["sekretaris", "super_admin"],
        terminal: false,
        transitions: {
          approve: "review_kadis",
          reject: "rejected",
          request_changes: "review_kauptd",
        },
      },
      review_kadis: {
        id: "review_kadis",
        label: "Final Approval Kepala Dinas",
        allowedRoles: ["kepala_dinas", "super_admin"],
        terminal: false,
        transitions: {
          approve: "finished",
          reject: "rejected",
        },
      },
      finished: {
        id: "finished",
        label: "Selesai",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
      rejected: {
        id: "rejected",
        label: "Ditolak",
        allowedRoles: [],
        terminal: true,
        transitions: {},
      },
    },
    initialNode: "draft",
  },
};

/**
 * Resolve graph untuk suatu unit_kerja string.
 * Fallback ke Sekretariat jika unit tidak dikenali.
 */
export function resolveGraph(unit_kerja = "") {
  const u = String(unit_kerja).toLowerCase();
  if (
    u.includes("bidang") ||
    u.includes("ketersediaan") ||
    u.includes("distribusi") ||
    u.includes("konsumsi")
  ) {
    return WORKFLOW_GRAPHS.Bidang;
  }
  if (u.includes("uptd")) {
    return WORKFLOW_GRAPHS.UPTD;
  }
  return WORKFLOW_GRAPHS.Sekretariat;
}

/**
 * Kembalikan node saat ini dari suatu instance.
 * Prioritas: current_node_id → legacy current_domain → initialNode
 */
export function getCurrentNode(instance, graph) {
  const nodeId =
    instance.current_node_id || instance.current_domain || graph.initialNode;
  return graph.nodes[nodeId] || graph.nodes[graph.initialNode];
}

/**
 * Validasi apakah role boleh melakukan action dari node saat ini.
 * super_admin selalu boleh.
 */
export function canTransition(node, action, userRole) {
  if (!node || !action) return false;
  if (userRole === "super_admin") return true;
  if (!node.allowedRoles.includes(userRole)) return false;
  return action in node.transitions;
}

/**
 * Hitung node berikutnya setelah action.
 * Return null jika tidak ada transisi valid.
 */
export function resolveNextNode(node, action, graph) {
  if (!node || !(action in node.transitions)) return null;
  const nextId = node.transitions[action];
  return graph.nodes[nextId] || null;
}
