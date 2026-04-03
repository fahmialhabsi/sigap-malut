import BdsKbj from "../models/BDS-KBJ.js";
import { logAudit } from "../services/auditLogService.js";
import {
  buildBdsKbjWhere,
  normalizeBdsKbjPayload,
} from "../services/bdsKbjService.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";

function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export const getAllBdsKbj = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = buildBdsKbjWhere(req.query);

    const { count, rows } = await BdsKbj.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["tanggal_dokumen", "DESC"],
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
      message: "Error fetching BdsKbj",
      error: error.message,
    });
  }
};

export const getBdsKbjById = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsKbj not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsKbj",
      error: error.message,
    });
  }
};

export const createBdsKbj = async (req, res) => {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const payload = normalizeBdsKbjPayload({
      ...req.body,
      created_by: req.user?.id ?? req.body?.created_by,
    });

    const record = await BdsKbj.create(payload);

    await logAudit({
      modul: "BDS-KBJ",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "BdsKbj created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsKbj",
      error: error.message,
    });
  }
};

export const updateBdsKbj = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsKbj not found",
      });
    }

    const threadUp = await gateOperationalUpdate(req, res, record);
    if (!threadUp) return;
    const dataLama = record.toJSON();
    const payload = normalizeBdsKbjPayload({
      ...req.body,
      created_by: record.created_by,
    });

    await record.update(payload);

    await logAudit({
      modul: "BDS-KBJ",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsKbj updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BdsKbj",
      error: error.message,
    });
  }
};

export const deleteBdsKbj = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsKbj not found",
      });
    }

    const dataLama = record.toJSON();
    await record.destroy();

    await logAudit({
      modul: "BDS-KBJ",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsKbj deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BdsKbj",
      error: error.message,
    });
  }
};
