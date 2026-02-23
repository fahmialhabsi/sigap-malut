import express from "express";
const router = express.Router();

let reminders = [];

router.get("/", (req, res) => {
  res.json(reminders);
});

router.post("/", (req, res) => {
  const { user, modulId, dataId, pesan, dueDate } = req.body;
  const entry = {
    user,
    modulId,
    dataId,
    pesan,
    dueDate,
    created: new Date().toISOString(),
    status: "open",
  };
  reminders.push(entry);
  res.status(201).json(entry);
});

router.put("/:id/complete", (req, res) => {
  const { id } = req.params;
  if (reminders[id]) reminders[id].status = "done";
  res.json(reminders[id]);
});
export default router;
