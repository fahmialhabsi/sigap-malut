import express from "express";
import * as ctrl from "../controllers/rbacController.js";
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import {
	permissionCreateSchema,
	permissionUpdateSchema,
	roleCreateSchema,
	roleUpdateSchema,
	assignPermissionsSchema,
	paginationSchema,
} from '../validators/rbacValidators.js';

const router = express.Router();

// Permissions
router.get("/permissions", authenticate, authorize('permission.view'), validate(paginationSchema, 'query'), ctrl.listPermissions);
router.post("/permissions", authenticate, authorize('permission.create'), validate(permissionCreateSchema, 'body'), ctrl.createPermission);
router.get("/permissions/:id", authenticate, authorize('permission.view'), ctrl.getPermission);
router.put("/permissions/:id", authenticate, authorize('permission.update'), validate(permissionUpdateSchema, 'body'), ctrl.updatePermission);
router.delete("/permissions/:id", authenticate, authorize('permission.delete'), ctrl.deletePermission);

// Roles
router.get("/roles", authenticate, authorize('role.view'), validate(paginationSchema, 'query'), ctrl.listRoles);
router.post("/roles", authenticate, authorize('role.create'), validate(roleCreateSchema, 'body'), ctrl.createRole);
router.get("/roles/:id", authenticate, authorize('role.view'), ctrl.getRole);
router.put("/roles/:id", authenticate, authorize('role.update'), validate(roleUpdateSchema, 'body'), ctrl.updateRole);
router.delete("/roles/:id", authenticate, authorize('role.delete'), ctrl.deleteRole);

// Role <-> Permission assignments
router.get("/roles", authenticate, authorize('role.view'), ctrl.listRoles);
router.post("/roles", authenticate, authorize('role.create'), ctrl.createRole);
router.get("/roles/:id", authenticate, authorize('role.view'), ctrl.getRole);
router.put("/roles/:id", authenticate, authorize('role.update'), ctrl.updateRole);
router.delete("/roles/:id", authenticate, authorize('role.delete'), ctrl.deleteRole);
router.post("/roles/:id/permissions", authenticate, authorize('role.assign'), validate(assignPermissionsSchema, 'body'), ctrl.assignPermissionsToRole);
router.delete("/roles/:id/permissions/:permId", authenticate, authorize('role.assign'), ctrl.removePermissionFromRole);

export default router;
