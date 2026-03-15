import express from "express";
const router = express.Router();

// Probe endpoint for workflowEngine health check
router.get("/probe", (_req, res) => {
  res.json({ loaded: true });
});

export default router;
