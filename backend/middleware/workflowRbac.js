// backend/middleware/workflowRbac.js
// Helper for workflow RBAC permission naming and middleware
import { authorize } from "./rbac.js";

/**
 * Map workflow action to permission string
 * @param {'read'|'create'|'update'|'delete'|'transition'|'transitions.read'} action
 * @returns {string}
 */
export function workflowPermission(action) {
  // TODO: Reconcile with global permission naming if needed
  const mapping = {
    read: "workflow:read",
    create: "workflow:create",
    update: "workflow:update",
    delete: "workflow:delete",
    transition: "workflow:transition",
    "transitions.read": "workflow:transitions.read",
  };
  return mapping[action] || `workflow:${action}`;
}

/**
 * Middleware to require workflow permission
 * @param {'read'|'create'|'update'|'delete'|'transition'|'transitions.read'} action
 */
export function requireWorkflowPermission(action) {
  return authorize(workflowPermission(action));
}

// TODO: Link to policy docs and review mapping with security team
