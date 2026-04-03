import BdsCpd from "../models/BDS-CPD.js";
import Komoditas from "../models/komoditas.js";
import { logAudit } from "../services/auditLogService.js";
import {
  buildBdsCpdWhere,
  normalizeBdsCpdPayload,
} from "../services/bdsCpdService.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../services/executionThreadGate.js";

if (!BdsCpd.associations?.komoditas) {
  BdsCpd.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
}

const INCLUDE_KOMODITAS = [
  {
    model: Komoditas,
    as: "komoditas",
    attributes: ["id", "nama", "kode", "satuan"],
    required: false,
  },
];

function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export const getAllBdsCpd = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = buildBdsCpdWhere(req.query);

    const { count, rows } = await BdsCpd.findAndCountAll({
      where,
      include: INCLUDE_KOMODITAS,
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
      message: "Error fetching BdsCpd",
      error: error.message,
    });
  }
};

export const getBdsCpdById = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id, {
      include: INCLUDE_KOMODITAS,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsCpd not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsCpd",
      error: error.message,
    });
  }
};

export const createBdsCpd = async (req, res) => {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const payload = normalizeBdsCpdPayload({
      ...req.body,
      created_by: req.user?.id ?? req.body?.created_by,
    });

    const record = await BdsCpd.create(payload);
    const created = await BdsCpd.findByPk(record.id, {
      include: INCLUDE_KOMODITAS,
    });

    await logAudit({
      modul: "BDS-CPD",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: created?.toJSON?.() ?? record,
      pegawai_id: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "BdsCpd created successfully",
      data: created ?? record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsCpd",
      error: error.message,
    });
  }
};

export const updateBdsCpd = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id, {
      include: INCLUDE_KOMODITAS,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsCpd not found",
      });
    }

    const threadUp = await gateOperationalUpdate(req, res, record);
    if (!threadUp) return;
    const dataLama = record.toJSON();
    const payload = normalizeBdsCpdPayload({
      ...req.body,
      created_by: record.created_by,
    });

    await record.update(payload);

    const updated = await BdsCpd.findByPk(req.params.id, {
      include: INCLUDE_KOMODITAS,
    });

    await logAudit({
      modul: "BDS-CPD",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: updated?.toJSON?.() ?? record,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsCpd updated successfully",
      data: updated ?? record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BdsCpd",
      error: error.message,
    });
  }
};

export const deleteBdsCpd = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id, {
      include: INCLUDE_KOMODITAS,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsCpd not found",
      });
    }

    const dataLama = record.toJSON();
    await record.destroy();

    await logAudit({
      modul: "BDS-CPD",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "BdsCpd deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BdsCpd",
      error: error.message,
    });
  }
};
