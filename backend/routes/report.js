import express from "express";
const router = express.Router();

let reports = [];

router.get("/", (req, res) => {
  res.json(reports);
});

router.post("/", (req, res) => {
  const { user, modulId, periode, tipe } = req.body;
  const entry = {
    user,
    modulId,
    periode,
    tipe,
    status: "generated",
    time: new Date().toISOString(),
  };
  reports.push(entry);
  res.status(201).json(entry);
});

router.put("/:modulId/:periode/approve", (req, res) => {
  const { modulId, periode } = req.params;
  const { user, tipe } = req.body;
  const entry = {
    user,
    modulId,
    periode,
    tipe,
    status: "approved",
    time: new Date().toISOString(),
  };
  reports.push(entry);
  res.json(entry);
});
export default router;
