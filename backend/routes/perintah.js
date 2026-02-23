import express from "express";
const router = express.Router();

// In-memory store (replace with DB in production)
let perintah = [];
let perintahLog = [];

// POST /perintah: Buat perintah baru
router.post("/", (req, res) => {
  const { judul, isi, dari_user_id, ke_user_id, deadline, lampiran } = req.body;
  const entry = {
    id: perintah.length + 1,
    judul,
    isi,
    dari_user_id,
    ke_user_id,
    waktu_buat: new Date().toISOString(),
    deadline,
    status: "draft",
    lampiran,
  };
  perintah.push(entry);
  perintahLog.push({
    perintah_id: entry.id,
    action: "create",
    oleh_user_id: dari_user_id,
    waktu: entry.waktu_buat,
    feedback: "",
    lampiran,
  });
  res.status(201).json(entry);
});

// GET /perintah/inbox: List perintah yang masuk ke user
router.get("/inbox", (req, res) => {
  const { user_id } = req.query;
  res.json(perintah.filter((p) => p.ke_user_id === user_id));
});

// GET /perintah/outbox: List perintah yang dikeluarkan oleh user
router.get("/outbox", (req, res) => {
  const { user_id } = req.query;
  res.json(perintah.filter((p) => p.dari_user_id === user_id));
});

// POST /perintah/:id/forward: Forward/limpahkan ke bawah
router.post("/:id/forward", (req, res) => {
  const { id } = req.params;
  const { ke_user_id, oleh_user_id, feedback } = req.body;
  const p = perintah.find((p) => p.id == id);
  if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });
  p.ke_user_id = ke_user_id;
  p.status = "forwarded";
  perintahLog.push({
    perintah_id: p.id,
    action: "forward",
    oleh_user_id,
    waktu: new Date().toISOString(),
    feedback,
    lampiran: null,
  });
  res.json(p);
});

// POST /perintah/:id/feedback: Feedback/revisi/kendala
router.post("/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { oleh_user_id, feedback } = req.body;
  const p = perintah.find((p) => p.id == id);
  if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });
  p.status = "feedback";
  perintahLog.push({
    perintah_id: p.id,
    action: "feedback",
    oleh_user_id,
    waktu: new Date().toISOString(),
    feedback,
    lampiran: null,
  });
  res.json(p);
});

// POST /perintah/:id/close: Tutup/akhiri perintah status selesai
router.post("/:id/close", (req, res) => {
  const { id } = req.params;
  const { oleh_user_id } = req.body;
  const p = perintah.find((p) => p.id == id);
  if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });
  p.status = "closed";
  perintahLog.push({
    perintah_id: p.id,
    action: "close",
    oleh_user_id,
    waktu: new Date().toISOString(),
    feedback: "",
    lampiran: null,
  });
  res.json(p);
});

// GET /perintah/:id/history: Lihat seluruh history perintah (audit trail)
router.get("/:id/history", (req, res) => {
  const { id } = req.params;
  res.json(perintahLog.filter((l) => l.perintah_id == id));
});

export default router;
