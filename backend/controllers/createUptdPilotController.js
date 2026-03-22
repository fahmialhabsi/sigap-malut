import { logAudit } from "../services/auditLogService.js";
import { normalizeUnitKerja } from "../config/pilotProjectPolicy.js";

const CONTROL_QUERY_KEYS = new Set([
  "page",
  "limit",
  "search",
  "sortBy",
  "sortOrder",
]);

const normalizeUserId = (user) => {
  if (!user?.id && user?.id !== 0) {
    return undefined;
  }

  return user.id;
};

const getAttributeMap = (model) => model?.rawAttributes || {};

const buildWhereFromQuery = (query, attributeMap, hasUnitKerja) => {
  const where = {};

  for (const [key, value] of Object.entries(query || {})) {
    if (CONTROL_QUERY_KEYS.has(key)) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(attributeMap, key)) {
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    where[key] = value;
  }

  if (hasUnitKerja) {
    // Pilot standard: semua data UPTD wajib terscope ke domain UPTD.
    where.unit_kerja = "UPTD";
  }

  return where;
};

const resolveOrder = (query, attributeMap) => {
  const fallbackField = attributeMap.created_at
    ? "created_at"
    : attributeMap.id
      ? "id"
      : Object.keys(attributeMap)[0];

  if (!fallbackField) {
    return undefined;
  }

  const requestedField =
    typeof query.sortBy === "string" && attributeMap[query.sortBy]
      ? query.sortBy
      : fallbackField;

  const requestedDirection = String(query.sortOrder || "DESC").toUpperCase();
  const direction = requestedDirection === "ASC" ? "ASC" : "DESC";

  return [[requestedField, direction]];
};

const buildWritePayload = ({
  input,
  user,
  hasUnitKerja,
  hasAksesTerbatas,
  hasCreatedBy,
  hasUpdatedBy,
  isCreate,
}) => {
  const payload = { ...input };
  const userId = normalizeUserId(user);

  if (hasUnitKerja) {
    payload.unit_kerja = "UPTD";
  }

  if (hasAksesTerbatas) {
    payload.akses_terbatas = true;
  }

  if (isCreate && hasCreatedBy && userId !== undefined) {
    payload.created_by = userId;
  }

  if (!isCreate) {
    if (
      hasCreatedBy &&
      Object.prototype.hasOwnProperty.call(payload, "created_by")
    ) {
      delete payload.created_by;
    }

    if (hasUpdatedBy && userId !== undefined) {
      payload.updated_by = userId;
    }
  }

  return payload;
};

const recordInPilotScope = (record, hasUnitKerja) => {
  if (!record) {
    return false;
  }

  if (!hasUnitKerja) {
    return true;
  }

  return normalizeUnitKerja(record.unit_kerja) === "UPTD";
};

const pilotMeta = (req) => req.pilotProject || null;

export const createUptdPilotController = ({
  model,
  moduleCode,
  entityName,
}) => {
  if (!model || !moduleCode || !entityName) {
    throw new Error(
      "createUptdPilotController membutuhkan model, moduleCode, dan entityName",
    );
  }

  const attributeMap = getAttributeMap(model);
  const hasUnitKerja = Boolean(attributeMap.unit_kerja);
  const hasAksesTerbatas = Boolean(attributeMap.akses_terbatas);
  const hasCreatedBy = Boolean(attributeMap.created_by);
  const hasUpdatedBy = Boolean(attributeMap.updated_by);

  const getAll = async (req, res) => {
    try {
      const pageRaw = Number.parseInt(req.query.page, 10);
      const limitRaw = Number.parseInt(req.query.limit, 10);
      const page = Number.isNaN(pageRaw) ? 1 : Math.max(1, pageRaw);
      const limit = Number.isNaN(limitRaw)
        ? 10
        : Math.min(100, Math.max(1, limitRaw));
      const offset = (page - 1) * limit;

      const where = buildWhereFromQuery(req.query, attributeMap, hasUnitKerja);
      // Hanya tampilkan data yang belum di-soft-delete
      if (Object.prototype.hasOwnProperty.call(attributeMap, "is_deleted")) {
        where.is_deleted = false;
      }
      const order = resolveOrder(req.query, attributeMap);

      const queryOptions = {
        where,
        limit,
        offset,
      };

      if (order) {
        queryOptions.order = order;
      }

      const { count, rows } = await model.findAndCountAll(queryOptions);

      return res.json({
        success: true,
        data: rows,
        pilot: pilotMeta(req),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit) || 1,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error fetching ${entityName}`,
        error: error.message,
      });
    }
  };

  const getById = async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);

      if (
        !record ||
        record.is_deleted ||
        !recordInPilotScope(record, hasUnitKerja)
      ) {
        return res.status(404).json({
          success: false,
          message: `${entityName} not found`,
        });
      }

      return res.json({
        success: true,
        data: record,
        pilot: pilotMeta(req),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error fetching ${entityName}`,
        error: error.message,
      });
    }
  };

  const create = async (req, res) => {
    try {
      const payload = buildWritePayload({
        input: req.body,
        user: req.user,
        hasUnitKerja,
        hasAksesTerbatas,
        hasCreatedBy,
        hasUpdatedBy,
        isCreate: true,
      });

      const record = await model.create(payload);

      await logAudit({
        modul: moduleCode,
        entitas_id: record.id,
        aksi: "CREATE",
        data_lama: null,
        data_baru: record.toJSON(),
        pegawai_id: normalizeUserId(req.user),
      });

      return res.status(201).json({
        success: true,
        message: `${entityName} created successfully`,
        data: record,
        pilot: pilotMeta(req),
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Error creating ${entityName}`,
        error: error.message,
      });
    }
  };

  const update = async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);

      if (
        !record ||
        record.is_deleted ||
        !recordInPilotScope(record, hasUnitKerja)
      ) {
        return res.status(404).json({
          success: false,
          message: `${entityName} not found`,
        });
      }

      const before = record.toJSON();
      const payload = buildWritePayload({
        input: req.body,
        user: req.user,
        hasUnitKerja,
        hasAksesTerbatas,
        hasCreatedBy,
        hasUpdatedBy,
        isCreate: false,
      });

      await record.update(payload);

      await logAudit({
        modul: moduleCode,
        entitas_id: record.id,
        aksi: "UPDATE",
        data_lama: before,
        data_baru: record.toJSON(),
        pegawai_id: normalizeUserId(req.user),
      });

      return res.json({
        success: true,
        message: `${entityName} updated successfully`,
        data: record,
        pilot: pilotMeta(req),
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Error updating ${entityName}`,
        error: error.message,
      });
    }
  };

  const remove = async (req, res) => {
    try {
      const record = await model.findByPk(req.params.id);

      if (
        !record ||
        record.is_deleted ||
        !recordInPilotScope(record, hasUnitKerja)
      ) {
        return res.status(404).json({
          success: false,
          message: `${entityName} not found`,
        });
      }

      const before = record.toJSON();
      const entityId = record.id;

      await record.update({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: req.user?.id || null,
      });

      await logAudit({
        modul: moduleCode,
        entitas_id: entityId,
        aksi: "DELETE",
        data_lama: before,
        data_baru: null,
        pegawai_id: normalizeUserId(req.user),
      });

      return res.json({
        success: true,
        message: `${entityName} deleted successfully`,
        pilot: pilotMeta(req),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error deleting ${entityName}`,
        error: error.message,
      });
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
};
