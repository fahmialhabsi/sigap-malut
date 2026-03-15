const express = require("express");
const router = express.Router();
const controller = require("../controllers/workflowController");

let rbac;
try {
  rbac = require("../middleware/rbacMiddleware");
} catch (e) {
  rbac = { allow: () => (req, res, next) => next() };
}

// POST /api/workflows
router.post("/workflows", rbac.allow("workflow:create"), controller.create);

// GET /api/workflows/:id
router.get("/workflows/:id", rbac.allow("workflow:read"), controller.getById);

// POST /api/workflows/:id/transition
router.post(
  "/workflows/:id/transition",
  rbac.allow("workflow:transition"),
  controller.transition,
);

module.exports = router;
