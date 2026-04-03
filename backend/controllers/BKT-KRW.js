import BktKrw from "../models/BKT-KRW.js";
import { logAudit } from "../services/auditLogService.js";
import {
  buildBktKrwWhere,
  normalizeBktKrwPayload,
} from "../services/bktKrwService.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";

export const getAllBktKrw = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = buildBktKrwWhere(req.query);

    const { count, rows } = await BktKrw.findAndCountAll({
      where,
      limit: Number(limit),
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
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BktKrw",
      error: error.message,
    });
  }
};

export const getBktKrwById = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BktKrw",
      error: error.message,
    });
  }
};

export const createBktKrw = async (req, res) => {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const payload = normalizeBktKrwPayload({
      ...req.body,
      created_by: req.user?.id ?? req.body?.created_by,
    });

    const record = await BktKrw.create(payload);

    await logAudit({
      modul: "BKT-KRW",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "BktKrw created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BktKrw",
      error: error.message,
    });
  }
};

export const updateBktKrw = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }

    const dataLama = { ...record.get() };
    const payload = normalizeBktKrwPayload({
      ...req.body,
      updated_by: req.user?.id,
    });

    await record.update(payload);

    await logAudit({
      modul: "BKT-KRW",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BktKrw updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BktKrw",
      error: error.message,
    });
  }
};

export const deleteBktKrw = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }

    const dataLama = { ...record.get() };
    await record.destroy();

    await logAudit({
      modul: "BKT-KRW",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BktKrw deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BktKrw",
      error: error.message,
    });
  }
};
