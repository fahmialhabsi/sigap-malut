import * as service from "../services/workflowService.js";
import {
  ensureScope,
  canOperateOnInstitution,
  isSystemAdmin,
} from "../middleware/authzHelpers.js";

// Semua controller workflows
export async function list(req, res, next) {
  try {
    ensureScope(req, "workflows:read");
    const { institution_id } = req.query;
    if (institution_id && !canOperateOnInstitution(req.user, institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot access workflows for this institution",
      });
    }
    const workflows = await service.listWorkflows({ institution_id });
    res.json(workflows);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    ensureScope(req, "workflows:write");
    const { name, description, institution_id, definition, metadata } =
      req.body;
    if (!name || !institution_id || !definition) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (!canOperateOnInstitution(req.user, institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot create workflow for this institution",
      });
    }
    const wf = await service.createWorkflow({
      name,
      description,
      institution_id,
      definition,
      metadata,
      created_by: req.user.id,
    });
    res.status(201).json(wf);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    ensureScope(req, "workflows:read");
    const wf = await service.getWorkflow(req.params.id);
    if (!wf)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    if (!canOperateOnInstitution(req.user, wf.institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot access this workflow",
      });
    }
    res.json(wf);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    ensureScope(req, "workflows:write");
    const wf = await service.getWorkflow(req.params.id);
    if (!wf)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    if (!canOperateOnInstitution(req.user, wf.institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot update this workflow",
      });
    }
    await service.updateWorkflow(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    ensureScope(req, "workflows:write");
    const wf = await service.getWorkflow(req.params.id);
    if (!wf)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    if (!canOperateOnInstitution(req.user, wf.institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot delete this workflow",
      });
    }
    await service.deleteWorkflow(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function transition(req, res, next) {
  try {
    ensureScope(req, "workflows:transition");
    const { to, actor_id, metadata, target_institution_id } = req.body;
    const wf = await service.getWorkflow(req.params.id);
    if (!wf)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    // Otorisasi lintas-institusi
    if (target_institution_id && target_institution_id !== wf.institution_id) {
      if (
        !isSystemAdmin(req.user) &&
        !(
          req.user.scopes &&
          req.user.scopes.includes("workflows:cross-institution")
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: cross-institution transition not allowed",
        });
      }
    } else if (!canOperateOnInstitution(req.user, wf.institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot transition this workflow",
      });
    }
    const result = await service.transitionWorkflow({
      id: req.params.id,
      to,
      actor_id: actor_id || req.user.id,
      metadata,
      target_institution_id,
    });
    res.json(result);
  } catch (err) {
    if (err.message.includes("Invalid transition")) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function transitions(req, res, next) {
  try {
    ensureScope(req, "workflows:read");
    const wf = await service.getWorkflow(req.params.id);
    if (!wf)
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    if (!canOperateOnInstitution(req.user, wf.institution_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot access transitions for this workflow",
      });
    }
    const transitions = await service.listTransitions(req.params.id);
    res.json(transitions);
  } catch (err) {
    next(err);
  }
}
