// Pegawai Routes (Master Data)
import express from "express";
import {
  listPegawai,
  searchPegawai,
  getPegawaiById,
} from "../controllers/pegawaiController.js";

const router = express.Router();

// GET /pegawai - List all pegawai
router.get("/", listPegawai);

// GET /pegawai/search?q= - Search pegawai by nama_lengkap or nip
router.get("/search", searchPegawai);

// GET /pegawai/:id - Get pegawai by ID
router.get("/:id", getPegawaiById);

export default router;
