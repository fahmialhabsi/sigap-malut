import express from "express";
const router = express.Router();

let notifications = [];

router.post("/", (req, res) => {
  const { user, type, message, target } = req.body;
  const entry = {
    user,
    type,
    message,
    target,
    time: new Date().toISOString(),
  };
  notifications.push(entry);
  // TODO: Integrasi ke email/websocket jika diperlukan
  res.status(201).json(entry);
});
export default router;
