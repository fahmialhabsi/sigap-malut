import express from "express";
const router = express.Router();

let auditTrail = [];

router.get("/", (req, res) => {
  res.json(auditTrail);
});

router.post("/", (req, res) => {
  const { user, action, detail } = req.body;
  const entry = {
    user,
    action,
    detail,
    time: new Date().toISOString(),
  };
  auditTrail.push(entry);
  res.status(201).json(entry);
});
export default router;
