/**
 * Example usage:
 * curl -X POST http://localhost:3000/api/workflows -H "Content-Type: application/json" -d '{"module":"sekretariat","entity_id":123,"domain_sequence":["pelaksana","sekretaris"]}'
 * curl http://localhost:3000/api/workflows/123
 * curl -X POST http://localhost:3000/api/workflows/129/transition -H "Content-Type: application/json" -d '{"action":"submit","comment":"test","user":{"id":1}}'
 */

import {
  createWorkflow,
  transitionWorkflow,
} from "../services/workflowService.js";
let WorkflowInstance;
try {
  WorkflowInstance = (await import("../models/WorkflowInstance.js")).default;
} catch (e) {
  WorkflowInstance = null;
}

export async function create(req, res, next) {
  try {
    const { module, module_id, entity_id, domain_sequence, payload } =
      req.body || {};
    if (!module && !module_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: module or module_id",
      });
    }
    if (!entity_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required field: entity_id" });
    }
    let ds = [];
    if (domain_sequence !== undefined) {
      if (!Array.isArray(domain_sequence)) {
        return res
          .status(400)
          .json({ success: false, error: "domain_sequence must be an array" });
      }
      ds = domain_sequence;
    }
    const data = {
      module: module || module_id,
      module_id: module_id || module,
      entity_id,
      domain_sequence: ds,
      ...(payload && typeof payload === "object" ? { payload } : {}),
    };
    const user = req.user || { id: 0 };
    const instance = await createWorkflow(data, user);
    return res.status(201).json({ success: true, data: instance });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (typeof next === "function") return next(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getById(req, res, next) {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Missing id parameter" });
    let instance = null;
    if (WorkflowInstance && WorkflowInstance.findByPk) {
      instance = await WorkflowInstance.findByPk(id);
      // else if (workflowService.getById) {
      //   instance = await workflowService.getById(id);
    }
    if (!instance)
      return res
        .status(404)
        .json({ success: false, error: "Workflow instance not found" });
    return res.status(200).json({ success: true, data: instance });
  } catch (err) {
    if (typeof next === "function") return next(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function transition(req, res, next) {
  try {
    const id = req.params.id;
    const {
      action,
      comment,
      user: userBody,
      instance: instanceBody,
    } = req.body || {};
    if (!action)
      return res.status(400).json({ success: false, error: "Missing action" });
    let instance = null;
    if (WorkflowInstance && WorkflowInstance.findByPk) {
      instance = await WorkflowInstance.findByPk(id);
    }
    if (!instance && instanceBody && instanceBody.id == id) {
      instance = instanceBody;
    }
    if (!instance)
      return res
        .status(404)
        .json({ success: false, error: "Workflow instance not found" });
    const user = req.user || userBody || { id: 0 };
    const result = await transitionWorkflow(instance, action, user, comment);
    // Reload instance after transition
    let updatedInstance = instance;
    if (WorkflowInstance && WorkflowInstance.findByPk) {
      updatedInstance = await WorkflowInstance.findByPk(id);
    }
    return res
      .status(200)
      .json({ success: true, result: updatedInstance || result });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (typeof next === "function") return next(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
