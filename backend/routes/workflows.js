import express from "express";
import * as controller from "../controllers/workflowController.js";

const router = express.Router();
let rbac;
try {
  rbac = (await import("../middleware/rbacMiddleware.js")).default;
} catch (e) {
  rbac = { allow: () => (req, res, next) => next() };
}

router.post("/workflows", rbac.allow("workflow:create"), controller.create);
router.get("/workflows/:id", rbac.allow("workflow:read"), controller.getById);
router.post(
  "/workflows/:id/transition",
  rbac.allow("workflow:transition"),
  controller.transition,
);

export default router;
