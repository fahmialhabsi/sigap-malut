import BdsLap from "../models/BDS-LAP.js";
import { logAudit } from "../services/auditLogService.js";
import {
  buildBdsLapWhere,
  normalizeBdsLapPayload,
} from "../services/bdsLapService.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";
import {
  buildDistribusiFinalPreview,
  getBdsLapLockInfo,
  syncDistribusiFinalToEPelara,
} from "../services/distribusiFinalService.js";

function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function getRawToken(req) {
  return (
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.replace("Bearer ", "")
      : null)
  );
}

async function ensureNotLocked(reportId) {
  const lockInfo = await getBdsLapLockInfo(reportId);
  if (lockInfo.locked) {
    const err = new Error("Laporan final ini sudah terkunci ke e-Pelara.");
    err.statusCode = 409;
    throw err;
  }
}

export const getAllBdsLap = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = buildBdsLapWhere(req.query);

    const { count, rows } = await BdsLap.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["periode", "DESC"],
        ["updated_at", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsLap",
      error: error.message,
    });
  }
};

export const getBdsLapById = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsLap not found",
      });
    }

    const lockInfo = await getBdsLapLockInfo(req.params.id);

    res.json({
      success: true,
      data: record,
      meta: {
        locked_to_e_pelara: lockInfo.locked,
        lock_log: lockInfo.latestSuccess,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsLap",
      error: error.message,
    });
  }
};

export const getBdsLapFinalisasiPreview = async (req, res) => {
  try {
    const preview = await buildDistribusiFinalPreview(req.query);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error building BdsLap final preview",
      error: error.message,
    });
  }
};

export const getBdsLapLockStatus = async (req, res) => {
  try {
    const lockInfo = await getBdsLapLockInfo(req.params.id);
    res.json({
      success: true,
      data: {
        locked: lockInfo.locked,
        latest_success: lockInfo.latestSuccess,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsLap lock status",
      error: error.message,
    });
  }
};

export const createBdsLap = async (req, res) => {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const payload = normalizeBdsLapPayload({
      ...req.body,
      created_by: req.user?.id ?? req.body?.created_by,
    });

    const record = await BdsLap.create(payload);

    await logAudit({
      modul: "BDS-LAP",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "BdsLap created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsLap",
      error: error.message,
    });
  }
};

export const updateBdsLap = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsLap not found",
      });
    }

    await ensureNotLocked(record.id);

    const threadUp = await gateOperationalUpdate(req, res, record);
    if (!threadUp) return;

    const dataLama = record.toJSON();
    const payload = normalizeBdsLapPayload({
      ...req.body,
      created_by: record.created_by,
    });

    await record.update(payload);

    await logAudit({
      modul: "BDS-LAP",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsLap updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: "Error updating BdsLap",
      error: error.message,
    });
  }
};

export const lockBdsLapToEPelara = async (req, res) => {
  const token = getRawToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan.",
    });
  }

  try {
    const result = await syncDistribusiFinalToEPelara({
      reportId: req.params.id,
      token,
      actor: req.user,
      force: Boolean(req.body?.force),
    });

    if (!result.ok) {
      const status =
        result.error === "not_found"
          ? 404
          : result.error === "already_locked"
            ? 409
            : result.error === "report_not_final"
              ? 409
              : 502;

      return res.status(status).json({
        success: false,
        message: result.message,
        error: result.error,
        lockInfo: result.lockInfo,
      });
    }

    res.json({
      success: true,
      message: "Laporan final berhasil dikunci dan dikirim ke e-Pelara.",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error locking BdsLap to e-Pelara",
      error: error.message,
    });
  }
};

export const deleteBdsLap = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsLap not found",
      });
    }

    await ensureNotLocked(record.id);

    const dataLama = record.toJSON();
    await record.destroy();

    await logAudit({
      modul: "BDS-LAP",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsLap deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: "Error deleting BdsLap",
      error: error.message,
    });
  }
};
