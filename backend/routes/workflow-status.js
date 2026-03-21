import express from "express";
const router = express.Router();

let workflowStatus = [];

router.get("/", (req, res) => {
  res.json(workflowStatus);
});

router.post("/", (req, res) => {
  const { user, modulId, status, detail } = req.body;
  const entry = {
    user,
    modulId,
    status,
    detail,
    time: new Date().toISOString(),
  };
  workflowStatus.push(entry);
  res.status(201).json(entry);
});
export default router;
