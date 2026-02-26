import express from "express";
const router = express.Router();

// In-memory store (replace with DB in production)
let approvals = [];

router.get("/", (req, res) => {
  res.json(approvals);
});

router.post("/", (req, res) => {
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

router.put("/:modulId/:dataId", (req, res) => {
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
