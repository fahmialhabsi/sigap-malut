import express from "express";
const router = express.Router();

let cases = [];

router.get("/", (req, res) => {
  res.json(cases);
});

router.post("/", (req, res) => {
  const { user, modulId, dataId, alertType, pesan } = req.body;
  const entry = {
    user,
    modulId,
    dataId,
    alertType,
    pesan,
    status: "open",
    created: new Date().toISOString(),
  };
  cases.push(entry);
  res.status(201).json(entry);
});

router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (cases[id]) cases[id].status = status;
  res.json(cases[id]);
});
export default router;
