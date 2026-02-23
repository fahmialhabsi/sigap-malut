import express from "express";
const router = express.Router();

let comments = [];

router.get("/", (req, res) => {
  const { modulId, dataId } = req.query;
  if (modulId && dataId) {
    return res.json(
      comments.filter((c) => c.modulId === modulId && c.dataId === dataId),
    );
  }
  res.json(comments);
});

router.post("/", (req, res) => {
  const { user, modulId, dataId, komentar } = req.body;
  const entry = {
    user,
    modulId,
    dataId,
    komentar,
    time: new Date().toISOString(),
  };
  comments.push(entry);
  res.status(201).json(entry);
});
export default router;
