import BdsMon from "../models/BDS-MON.js";
import Komoditas from "../models/komoditas.js";
import { logAudit } from "../services/auditLogService.js";
import {
  buildBdsMonWhere,
  normalizeBdsMonPayload,
} from "../services/bdsMonService.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";

if (!BdsMon.associations?.komoditas) {
  BdsMon.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
}

const KOMODITAS_INCLUDE = [
  {
    model: Komoditas,
    as: "komoditas",
    attributes: ["id", "nama", "kode", "satuan"],
    required: false,
  },
];

export const getAllBdsMon = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = buildBdsMonWhere(req.query);

    const { count, rows } = await BdsMon.findAndCountAll({
      where,
      include: KOMODITAS_INCLUDE,
      limit: Number(limit),
      offset,
      order: [
        ["periode", "DESC"],
        ["updated_at", "DESC"],
        ["created_at", "DESC"],
      ],
      distinct: true,
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
      message: "Error fetching BdsMon",
      error: error.message,
    });
  }
};

export const getBdsMonById = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id, {
      include: KOMODITAS_INCLUDE,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsMon not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsMon",
      error: error.message,
    });
  }
};

export const createBdsMon = async (req, res) => {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const payload = normalizeBdsMonPayload({
      ...req.body,
      created_by: req.user?.id ?? req.body?.created_by,
    });

    const record = await BdsMon.create(payload);

    await logAudit({
      modul: "BDS-MON",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "BdsMon created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsMon",
      error: error.message,
    });
  }
};

export const updateBdsMon = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsMon not found",
      });
    }

    const dataLama = { ...record.get() };
    const payload = normalizeBdsMonPayload({
      ...req.body,
      updated_by: req.user?.id,
    });

    await record.update(payload);

    await logAudit({
      modul: "BDS-MON",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsMon updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BdsMon",
      error: error.message,
    });
  }
};

export const deleteBdsMon = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsMon not found",
      });
    }

    const dataLama = { ...record.get() };
    await record.destroy();

    await logAudit({
      modul: "BDS-MON",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsMon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BdsMon",
      error: error.message,
    });
  }
};
