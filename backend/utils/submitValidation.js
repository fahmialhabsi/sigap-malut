/**
 * submitValidation.js — SINGLE SOURCE OF TRUTH for task submit validation rules.
 *
 * HISTORY:
 *   Before v2.6: Two separate handlers used different URL-check logic:
 *     - taskController.js: used title-regex heuristic (fragile, non-deterministic)
 *     - pelaksanaSekretariat/tugasController.js: module/modul_id field lookup
 *   This caused non-deterministic behavior for tasks with module="kepegawaian"
 *   but a generic title, or vice versa.
 *
 *   v2.6 fix: all submit handlers MUST import and call these functions.
 *   Decision: module/modul_id field-based check is canonical (more reliable
 *   than title heuristic). Title is an arbitrary user string; module is
 *   a structured system field.
 *
 * USAGE:
 *   import { validateSubmitPayload, requiresOutputUrl } from '../utils/submitValidation.js';
 *
 *   const result = validateSubmitPayload(task, req.body.output_ringkas, req.body.output_url);
 *   if (!result.ok) return res.status(400).json({ success: false, ...result });
 */

/**
 * Canonical set of module codes that require an output URL.
 * Basis: module/modul_id field in Task (structured, not user-typed title).
 */
const URL_REQUIRED_MODULES = ["kepegawaian", "asn", "kgb", "absensi"];

/**
 * Determine whether a given task requires output_url on submit.
 * Uses task.module or task.modul_id (server-assigned field).
 * Does NOT use task.title (user-supplied, non-deterministic).
 *
 * @param {object} task - Sequelize Task instance or plain object with module/modul_id
 * @returns {boolean}
 */
export function requiresOutputUrl(task) {
  const modul = String(task.module || task.modul_id || "").toLowerCase().trim();
  return URL_REQUIRED_MODULES.some((k) => modul.includes(k));
}

/**
 * Validate submit payload. Single authoritative check for ALL submit paths.
 *
 * @param {object} task - Task record from DB
 * @param {string|undefined} output_ringkas - User-supplied summary
 * @param {string|undefined} output_url    - User-supplied attachment URL
 * @returns {{ ok: boolean, code?: string, message?: string }}
 */
export function validateSubmitPayload(task, output_ringkas, output_url) {
  const ringkas = String(output_ringkas || "").trim();

  // Rule 1: minimum content length
  if (ringkas.length < 50) {
    return {
      ok: false,
      code: "OUTPUT_TOO_SHORT",
      message:
        "Ringkasan hasil wajib diisi minimal 50 karakter. Jelaskan konkret apa yang sudah disiapkan sesuai perintah.",
    };
  }

  // Rule 2: URL required for structured modules (deterministic, module-field-based)
  if (requiresOutputUrl(task) && !String(output_url || "").trim()) {
    return {
      ok: false,
      code: "OUTPUT_URL_REQUIRED",
      message:
        "Tugas dengan modul kepegawaian/ASN/KGB/absensi wajib menyertakan tautan dokumen pendukung (output_url).",
    };
  }

  return { ok: true };
}
