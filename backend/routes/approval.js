import express from "express";
import { authorize } from "../middleware/rbac.js";
const router = express.Router();

// In-memory store (replace with DB in production)
let approvals = [];

// RBAC: read approval
router.get("/", authorize("approval:read"), (req, res) => {
  res.json(approvals);
});

// RBAC: submit approval
router.post("/", authorize("approval:create"), (req, res) => {
  const { user, modulId, dataId, detail } = req.body;
  const entry = {
    user,
    modulId,
    dataId,
    status: "diajukan",
    detail,
    time: new Date().toISOString(),
  };
  approvals.push(entry);
  res.status(201).json(entry);
});

// RBAC: update approval status
router.put("/:modulId/:dataId", authorize("approval:update"), (req, res) => {
  const { user, status, detail } = req.body;
  const { modulId, dataId } = req.params;
  const entry = {
    user,
    modulId,
    dataId,
    status,
    detail,
    time: new Date().toISOString(),
  };
  approvals.push(entry);
  res.json(entry);
});
export default router;
