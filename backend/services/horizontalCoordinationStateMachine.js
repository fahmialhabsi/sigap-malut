/**
 * Model status resmi koordinasi horizontal (`horizontal_coordination_requests.status`).
 * Satu sumber kebenaran untuk validasi API, dashboard, dan timeline.
 */

/** Status alur kerja (non-terminal) — diubah lewat PATCH .../status */
export const HCOORD_WORKFLOW_STATUSES = [
  "diajukan",
  "diterima",
  "diproses",
  "menunggu_balasan",
  "terlambat",
];

/** Status penutupan — diubah lewat PATCH .../respond */
export const HCOORD_TERMINAL_STATUSES = [
  "selesai",
  "dibatalkan",
  "ditolak",
  "gagal_koordinasi",
];

const WORKFLOW_SET = new Set(HCOORD_WORKFLOW_STATUSES);
const TERMINAL_SET = new Set(HCOORD_TERMINAL_STATUSES);

/** Peta transisi resmi PATCH /status (from → Set<to>) */
const PATCH_ALLOWED = {
  diajukan: new Set(["diterima", "dibatalkan"]),
  diterima: new Set(["diproses", "dibatalkan"]),
  diproses: new Set(["menunggu_balasan", "terlambat", "dibatalkan"]),
  menunggu_balasan: new Set(["diproses", "terlambat", "dibatalkan"]),
  terlambat: new Set(["diproses", "gagal_koordinasi", "dibatalkan"]),
};

export function normalizeHCoordStatus(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .slice(0, 32);
}

export function isHCoordTerminalStatus(status) {
  return TERMINAL_SET.has(normalizeHCoordStatus(status));
}

export function isHCoordWorkflowStatus(status) {
  return WORKFLOW_SET.has(normalizeHCoordStatus(status));
}

export function isHCoordOpenStatus(status) {
  return !isHCoordTerminalStatus(status);
}

/**
 * Validasi transisi PATCH /horizontal/:id/status
 * @returns {{ ok: true } | { ok: false, code: string, message: string, from_status?: string, to_status?: string }}
 */
export function validateHCoordPatchTransition(fromStatus, toStatus) {
  const from = normalizeHCoordStatus(fromStatus);
  const to = normalizeHCoordStatus(toStatus);

  if (!to) {
    return {
      ok: false,
      code: "HCOORD_STATUS_INVALID",
      message: "Field status wajib.",
    };
  }

  if (isHCoordTerminalStatus(from)) {
    return {
      ok: false,
      code: "HCOORD_ALREADY_CLOSED",
      message: "Item koordinasi sudah tertutup; transisi alur tidak lagi diizinkan.",
      from_status: from,
      to_status: to,
    };
  }

  if (!isHCoordWorkflowStatus(from)) {
    return {
      ok: false,
      code: "HCOORD_INVALID_STATE",
      message: `Status saat ini "${from}" tidak termasuk alur resmi; hubungi admin data.`,
      from_status: from,
      to_status: to,
    };
  }

  /** Pembatalan jalur kerja (tanpa balasan formal). */
  if (to === "dibatalkan") {
    const allowed = PATCH_ALLOWED[from];
    if (!allowed?.has("dibatalkan")) {
      return {
        ok: false,
        code: "HCOORD_INVALID_TRANSITION",
        message: `Pembatalan dari status "${from}" tidak diizinkan.`,
        from_status: from,
        to_status: to,
        allowed_to: allowed ? [...allowed] : [],
      };
    }
    return { ok: true };
  }

  /** Kegagalan koordinasi setelah eskalasi SLA. */
  if (to === "gagal_koordinasi") {
    if (from !== "terlambat") {
      return {
        ok: false,
        code: "HCOORD_GAGAL_REQUIRES_TERLAMBAT",
        message: 'Status "gagal_koordinasi" pada PATCH hanya diizinkan dari "terlambat".',
        from_status: from,
        to_status: to,
      };
    }
    return { ok: true };
  }

  if (isHCoordTerminalStatus(to)) {
    return {
      ok: false,
      code: "HCOORD_USE_RESPOND_ENDPOINT",
      message:
        "Untuk menutup dengan selesai atau ditolak gunakan PATCH .../respond (dengan response_body bila perlu).",
      from_status: from,
      to_status: to,
    };
  }

  if (!isHCoordWorkflowStatus(to)) {
    return {
      ok: false,
      code: "HCOORD_STATUS_INVALID",
      message: `Status tidak dikenali. Alur kerja: ${HCOORD_WORKFLOW_STATUSES.join(", ")}.`,
      from_status: from,
      to_status: to,
    };
  }

  const allowed = PATCH_ALLOWED[from];
  if (!allowed || !allowed.has(to)) {
    return {
      ok: false,
      code: "HCOORD_INVALID_TRANSITION",
      message: `Transisi dari "${from}" ke "${to}" tidak diizinkan. Transisi valid dari ${from}: ${[...(allowed || [])].join(", ") || "—"}.`,
      from_status: from,
      to_status: to,
      allowed_to: allowed ? [...allowed] : [],
    };
  }

  return { ok: true };
}

/**
 * Validasi PATCH .../respond → status terminal.
 * gagal_koordinasi hanya dari status terlambat (eskalasi formal).
 */
export function validateHCoordRespondTransition(fromStatus, toTerminal) {
  const from = normalizeHCoordStatus(fromStatus);
  const to = normalizeHCoordStatus(toTerminal);

  if (!to || !TERMINAL_SET.has(to)) {
    return {
      ok: false,
      code: "HCOORD_STATUS_INVALID",
      message: `Status penutupan harus salah satu: ${HCOORD_TERMINAL_STATUSES.join(", ")}.`,
      from_status: from,
      to_status: to,
    };
  }

  if (isHCoordTerminalStatus(from)) {
    return {
      ok: false,
      code: "HCOORD_ALREADY_CLOSED",
      message: "Koordinasi sudah tertutup.",
      from_status: from,
      to_status: to,
    };
  }

  if (!isHCoordWorkflowStatus(from)) {
    return {
      ok: false,
      code: "HCOORD_INVALID_STATE",
      message: `Status saat ini "${from}" tidak dapat ditutup lewat endpoint ini.`,
      from_status: from,
      to_status: to,
    };
  }

  if (to === "gagal_koordinasi" && from !== "terlambat") {
    return {
      ok: false,
      code: "HCOORD_GAGAL_REQUIRES_TERLAMBAT",
      message:
        'Status "gagal_koordinasi" hanya jika alur saat ini "terlambat", atau gunakan PATCH .../status dari terlambat.',
      from_status: from,
      to_status: to,
    };
  }

  return { ok: true };
}

/** Ringkasan untuk dokumentasi / error bantuan */
export function getHCoordTransitionSummary() {
  return {
    workflow_statuses: [...HCOORD_WORKFLOW_STATUSES],
    terminal_statuses: [...HCOORD_TERMINAL_STATUSES],
    patch_transitions: Object.fromEntries(
      Object.entries(PATCH_ALLOWED).map(([k, v]) => [k, [...v]]),
    ),
    respond_note:
      "selesai | dibatalkan | ditolak dari alur terbuka; gagal_koordinasi hanya dari terlambat.",
  };
}
