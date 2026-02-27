import Permission from "../models/permission.js";
import Role from "../models/role.js";
import RolePermission from "../models/rolePermission.js";

export const listPermissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const where = q
      ? { key: { [Permission.sequelize.Op.like]: `%${q}%` } }
      : {};
    const offset = (page - 1) * limit;
    const { count, rows } = await Permission.findAndCountAll({ where, order: [["key", "ASC"]], offset, limit });
    res.json({ success: true, data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) {
    next(err);
  }
};

export const createPermission = async (req, res, next) => {
  try {
    const { key, description } = req.body;
    const [perm] = await Permission.findOrCreate({
      where: { key },
      defaults: { description },
    });
    res.status(201).json({ success: true, data: perm });
  } catch (err) {
    next(err);
  }
};

export const getPermission = async (req, res, next) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm)
      return res
        .status(404)
        .json({ success: false, message: "Permission not found" });
    res.json({ success: true, data: perm });
  } catch (err) {
    next(err);
  }
};

export const updatePermission = async (req, res, next) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm)
      return res
        .status(404)
        .json({ success: false, message: "Permission not found" });
    await perm.update(req.body);
    res.json({ success: true, data: perm });
  } catch (err) {
    next(err);
  }
};

export const deletePermission = async (req, res, next) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm)
      return res
        .status(404)
        .json({ success: false, message: "Permission not found" });
    await perm.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// Roles
export const listRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const where = q ? { name: { [Role.sequelize.Op.like]: `%${q}%` } } : {};
    const offset = (page - 1) * limit;
    const { count, rows } = await Role.findAndCountAll({ where, order: [["name", "ASC"]], offset, limit });
    res.json({ success: true, data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [role] = await Role.findOrCreate({
      where: { name },
      defaults: { description },
    });
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

export const getRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    // fetch permissions
    const rps = await RolePermission.findAll({ where: { role_id: role.id } });
    const permIds = rps.map((r) => r.permission_id);
    const perms = await Permission.findAll({ where: { id: permIds } });
    res.json({ success: true, data: { role, permissions: perms } });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    await role.update(req.body);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    await RolePermission.destroy({ where: { role_id: role.id } });
    await role.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

export const assignPermissionsToRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    const { permissionIds } = req.body;
    if (!Array.isArray(permissionIds))
      return res
        .status(400)
        .json({ success: false, message: "permissionIds must be array" });
    for (const pid of permissionIds) {
      await RolePermission.findOrCreate({
        where: { role_id: role.id, permission_id: pid },
      });
    }
    res.json({ success: true, message: "Permissions assigned" });
  } catch (err) {
    next(err);
  }
};

export const removePermissionFromRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    const pid = req.params.permId;
    await RolePermission.destroy({
      where: { role_id: role.id, permission_id: pid },
    });
    res.json({ success: true, message: "Permission removed" });
  } catch (err) {
    next(err);
  }
};
