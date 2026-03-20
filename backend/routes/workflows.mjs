import express from "express";

// Factory function for workflow router with DI
export function createWorkflowRouter({
  protect,
  requireWorkflowPermission,
  controller,
}) {
  const router = express.Router();

  router.get(
    "/workflows",
    protect,
    requireWorkflowPermission("read"),
    controller.list,
  );
  router.post(
    "/workflows",
    protect,
    requireWorkflowPermission("create"),
    controller.create,
  );
  router.get(
    "/workflows/:id",
    protect,
    requireWorkflowPermission("read"),
    controller.getById,
  );
  router.put(
    "/workflows/:id",
    protect,
    requireWorkflowPermission("update"),
    controller.update,
  );
  router.delete(
    "/workflows/:id",
    protect,
    requireWorkflowPermission("delete"),
    controller.remove,
  );
  return router;
}
