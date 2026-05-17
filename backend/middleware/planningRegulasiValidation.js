import Joi from "joi";

const nonEmptyPagu = (value, helpers) => {
  const paguVal = value.pagu ?? value.anggaran;
  if (paguVal === undefined || paguVal === null || String(paguVal).trim() === "") {
    return helpers.error("any.invalid", {
      message: "pagu atau anggaran wajib berisi nilai",
    });
  }
  return value;
};

const nonEmptyRkpdPagu = (value, helpers) => {
  const paguVal = value.pagu_anggaran ?? value.pagu ?? value.anggaran;
  if (paguVal === undefined || paguVal === null || String(paguVal).trim() === "") {
    return helpers.error("any.invalid", {
      message: "pagu / pagu_anggaran / anggaran wajib berisi nilai",
    });
  }
  return value;
};

export const renjaCreateSchema = Joi.object({
  tahun: Joi.number().integer().min(2000).max(2100).required(),
  program: Joi.string().trim().min(1).required(),
  kegiatan: Joi.string().trim().min(1).required(),
  indikator: Joi.string().trim().min(1).required(),
  pagu: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  perangkat_daerah: Joi.string().allow("", null).optional(),
  judul: Joi.string().allow("", null).optional(),
  target: Joi.string().allow("", null).optional(),
  renstra_id: Joi.number().integer().allow(null).optional(),
  status: Joi.string().max(64).optional(),
})
  .or("pagu", "anggaran")
  .custom(nonEmptyPagu)
  .unknown(true);

export const renjaUpdateSchema = Joi.object({
  tahun: Joi.number().integer().min(2000).max(2100).optional(),
  program: Joi.string().trim().min(1).optional(),
  kegiatan: Joi.string().trim().min(1).optional(),
  indikator: Joi.string().trim().min(1).optional(),
  pagu: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  perangkat_daerah: Joi.string().allow("", null).optional(),
  judul: Joi.string().allow("", null).optional(),
  target: Joi.string().allow("", null).optional(),
  renstra_id: Joi.number().integer().allow(null).optional(),
  status: Joi.string().max(64).optional(),
})
  .min(1)
  .unknown(true);

export const rkpdCreateSchema = Joi.object({
  tahun: Joi.number().integer().min(2000).max(2100).required(),
  renja_id: Joi.number().integer().positive().required(),
  nama_sub_kegiatan: Joi.string().trim().min(1).required(),
  indikator: Joi.string().trim().min(1).required(),
  pagu_anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  pagu: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  target: Joi.string().allow("", null).optional(),
  periode_rpjmd_id: Joi.number().integer().allow(null).optional(),
  status: Joi.string().max(64).optional(),
})
  .or("pagu_anggaran", "pagu", "anggaran")
  .custom(nonEmptyRkpdPagu)
  .unknown(true);

export const rkpdUpdateSchema = Joi.object({
  tahun: Joi.number().integer().min(2000).max(2100).optional(),
  renja_id: Joi.number().integer().positive().allow(null).optional(),
  nama_sub_kegiatan: Joi.string().trim().min(1).optional(),
  indikator: Joi.string().trim().min(1).optional(),
  pagu_anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  pagu: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  anggaran: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  target: Joi.string().allow("", null).optional(),
  periode_rpjmd_id: Joi.number().integer().allow(null).optional(),
  status: Joi.string().max(64).optional(),
})
  .min(1)
  .unknown(true);

function formatJoi(err) {
  return err.details.map((d) => d.message).join("; ");
}

export function validateRenjaCreate(req, res, next) {
  const { error, value } = renjaCreateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: formatJoi(error) });
  }
  req.body = value;
  next();
}

export function validateRenjaUpdate(req, res, next) {
  const { error, value } = renjaUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: formatJoi(error) });
  }
  req.body = value;
  next();
}

export function validateRkpdCreate(req, res, next) {
  const { error, value } = rkpdCreateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: formatJoi(error) });
  }
  req.body = value;
  next();
}

export function validateRkpdUpdate(req, res, next) {
  const { error, value } = rkpdUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: formatJoi(error) });
  }
  req.body = value;
  next();
}
