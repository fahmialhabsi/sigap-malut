import PengajuanKeGubernur from "../models/PengajuanKeGubernur.js";
import ClarificationThread from "../models/ClarificationThread.js";
import Task from "../models/Task.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import SuratMasuk from "../models/SuratMasuk.js";
import Disposisi from "../models/Disposisi.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function relaxedMode() {
  return String(process.env.THREAD_ENFORCEMENT_RELAXED || "").toLowerCase() === "true";
}

function headerThreadId(req) {
  const h = req?.headers || {};
  const raw =
    h["x-execution-thread-id"] ||
    h["X-Execution-Thread-Id"] ||
    h["x-thread-id"] ||
    "";
  return String(raw || "").trim();
}

/**
 * Menentukan execution_thread_id untuk penulisan data operasional (tanpa UUID acak).
 * Sumber: execution_thread_id eksplisit, task_id, instruksi_id, pengajuan_id, clarification_thread_id.
 */
export async function resolveOperationalExecutionThread(body, req = {}) {
  const b = body && typeof body === "object" ? body : {};
  const direct = String(b.execution_thread_id || "").trim();
  if (direct && UUID_RE.test(direct)) {
    return { ok: true, execution_thread_id: direct, task_id: b.task_id ?? null, source: "body_uuid" };
  }

  const hdr = headerThreadId(req);
  if (hdr && UUID_RE.test(hdr)) {
    return { ok: true, execution_thread_id: hdr, task_id: b.task_id ?? null, source: "header" };
  }

  const taskId = b.task_id != null ? Number(b.task_id) : null;
  if (Number.isFinite(taskId) && taskId > 0) {
    const task = await Task.findByPk(taskId, { attributes: ["id", "execution_thread_id"] });
    const tid = task?.getDataValue?.("execution_thread_id") || task?.execution_thread_id;
    if (tid && UUID_RE.test(String(tid))) {
      return { ok: true, execution_thread_id: String(tid), task_id: taskId, source: "task" };
    }
    return {
      ok: false,
      code: "TASK_TANPA_THREAD",
      message:
        "task_id mengarah ke tugas tanpa execution_thread_id. Selesaikan rantai tugas atau kirim execution_thread_id.",
    };
  }

  const instrId =
    b.instruksi_id != null
      ? Number(b.instruksi_id)
      : b.sumber_instruksi_gubernur_id != null
        ? Number(b.sumber_instruksi_gubernur_id)
        : null;
  if (Number.isFinite(instrId) && instrId > 0) {
    const ig = await InstruksiGubernur.findByPk(instrId, {
      attributes: ["id", "execution_thread_id"],
    });
    const tid = ig?.getDataValue?.("execution_thread_id") || ig?.execution_thread_id;
    if (tid && UUID_RE.test(String(tid))) {
      return { ok: true, execution_thread_id: String(tid), task_id: null, source: "instruksi" };
    }
    return {
      ok: false,
      code: "INSTRUKSI_TANPA_THREAD",
      message: "Instruksi belum terikat thread. Sinkronkan data instruksi terlebih dahulu.",
    };
  }

  const pengId = b.pengajuan_id != null ? Number(b.pengajuan_id) : null;
  if (Number.isFinite(pengId) && pengId > 0) {
    const p = await PengajuanKeGubernur.findByPk(pengId, {
      attributes: ["id", "execution_thread_id"],
    });
    const tid = p?.getDataValue?.("execution_thread_id") || p?.execution_thread_id;
    if (tid && UUID_RE.test(String(tid))) {
      return { ok: true, execution_thread_id: String(tid), task_id: null, source: "pengajuan" };
    }
    return {
      ok: false,
      code: "PENGAJUAN_TANPA_THREAD",
      message: "Pengajuan belum memiliki execution_thread_id.",
    };
  }

  const clarId = b.clarification_thread_id != null ? Number(b.clarification_thread_id) : null;
  if (Number.isFinite(clarId) && clarId > 0) {
    const c = await ClarificationThread.findByPk(clarId, {
      attributes: ["id", "execution_thread_id"],
    });
    const tid = c?.getDataValue?.("execution_thread_id") || c?.execution_thread_id;
    if (tid && UUID_RE.test(String(tid))) {
      return { ok: true, execution_thread_id: String(tid), task_id: null, source: "klarifikasi" };
    }
    return {
      ok: false,
      code: "KLARIFIKASI_TANPA_THREAD",
      message: "Thread klarifikasi belum terikat execution_thread_id.",
    };
  }

  const suratMasukId = b.surat_masuk_id != null ? Number(b.surat_masuk_id) : null;
  if (Number.isFinite(suratMasukId) && suratMasukId > 0) {
    const sm = await SuratMasuk.findByPk(suratMasukId, {
      attributes: ["id", "execution_thread_id", "task_id"],
    });
    const tid = sm?.getDataValue?.("execution_thread_id") || sm?.execution_thread_id;
    const taskFromSurat = sm?.getDataValue?.("task_id") ?? sm?.task_id ?? null;
    if (tid && UUID_RE.test(String(tid))) {
      const taskIdBody =
        b.task_id != null && Number.isFinite(Number(b.task_id)) ? Number(b.task_id) : null;
      const taskIdSurat =
        taskFromSurat != null && Number.isFinite(Number(taskFromSurat))
          ? Number(taskFromSurat)
          : null;
      return {
        ok: true,
        execution_thread_id: String(tid),
        task_id: taskIdBody ?? taskIdSurat,
        source: "surat_masuk",
      };
    }
    return {
      ok: false,
      code: "SURAT_TANPA_THREAD",
      message:
        "Surat masuk belum memiliki execution_thread_id. Ikat surat ke thread eksekusi terlebih dahulu.",
    };
  }

  const disposisiId = b.disposisi_id != null ? Number(b.disposisi_id) : null;
  if (Number.isFinite(disposisiId) && disposisiId > 0) {
    const d = await Disposisi.findByPk(disposisiId, { attributes: ["id", "surat_masuk_id"] });
    const sid = d?.getDataValue?.("surat_masuk_id") ?? d?.surat_masuk_id;
    if (!sid) {
      return {
        ok: false,
        code: "DISPOSISI_INVALID",
        message: "Disposisi tidak memiliki surat_masuk_id.",
      };
    }
    const sm = await SuratMasuk.findByPk(sid, {
      attributes: ["id", "execution_thread_id", "task_id"],
    });
    const tid = sm?.getDataValue?.("execution_thread_id") || sm?.execution_thread_id;
    const taskFromSurat = sm?.getDataValue?.("task_id") ?? sm?.task_id ?? null;
    if (tid && UUID_RE.test(String(tid))) {
      const taskIdBody =
        b.task_id != null && Number.isFinite(Number(b.task_id)) ? Number(b.task_id) : null;
      const taskIdSurat =
        taskFromSurat != null && Number.isFinite(Number(taskFromSurat))
          ? Number(taskFromSurat)
          : null;
      return {
        ok: true,
        execution_thread_id: String(tid),
        task_id: taskIdBody ?? taskIdSurat,
        source: "disposisi",
      };
    }
    return {
      ok: false,
      code: "SURAT_TANPA_THREAD",
      message:
        "Surat terkait disposisi belum memiliki execution_thread_id. Ikat surat ke thread eksekusi terlebih dahulu.",
    };
  }

  if (relaxedMode()) {
    const { randomUUID } = await import("crypto");
    const u = randomUUID();
    return {
      ok: true,
      execution_thread_id: u,
      task_id: null,
      source: "relaxed_new_uuid",
      warning: "THREAD_ENFORCEMENT_RELAXED aktif — tidak untuk produksi.",
    };
  }

  return {
    ok: false,
    code: "THREAD_WAJIB",
    message:
      "Wajib menyertakan salah satu: execution_thread_id (UUID), task_id, instruksi_id / sumber_instruksi_gubernur_id, pengajuan_id, clarification_thread_id, surat_masuk_id, disposisi_id, atau header X-Execution-Thread-Id.",
  };
}
