import engine from "../services/workflowEngine.js";

export async function transition(req, res, next) {
  try {
    const workflowName = req.params.workflowName;
    const { to, entityId, modelName, entity: payloadEntity, note } = req.body;

    // derive user from req (Auth middleware should set req.user), fallback to body
    const user = req.user || req.body.user || null;

    let instance = payloadEntity || null;
    const models =
      req.app && typeof req.app.get === "function"
        ? req.app.get("models")
        : null;

    if (!instance && modelName && models && models[modelName]) {
      const Model = models[modelName];
      instance = await Model.findByPk(entityId);
    }

    // If still no instance, create a minimal entity object
    if (!instance)
      instance = { id: entityId, status: req.body.from || "draft" };

    const updated = await engine.performTransition({
      workflowName,
      entity: instance,
      to,
      user,
      app: req.app,
      note,
    });

    return res.json({ success: true, workflow: workflowName, result: updated });
  } catch (err) {
    const status =
      err && err.message === "workflow_not_found"
        ? 404
        : err.meta && err.meta.reason === "missing_permission"
          ? 403
          : 400;
    return res
      .status(status)
      .json({ success: false, message: err.message, meta: err.meta || null });
  }
}

export default { transition };
