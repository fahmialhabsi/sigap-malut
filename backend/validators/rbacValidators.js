import Joi from "joi";

export const permissionCreateSchema = Joi.object({
  key: Joi.string().max(150).required(),
  description: Joi.string().allow(null, "").optional(),
});

export const permissionUpdateSchema = Joi.object({
  key: Joi.string().max(150).optional(),
  description: Joi.string().allow(null, "").optional(),
});

export const roleCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow(null, "").optional(),
});

export const roleUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().allow(null, "").optional(),
});

export const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array()
    .items(Joi.number().integer().positive())
    .required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(25),
  q: Joi.string().allow("", null).optional(),
});
