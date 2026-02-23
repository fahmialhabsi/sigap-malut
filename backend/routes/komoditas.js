// Komoditas Routes (Master Data)
import express from "express";
import {
  listKomoditas,
  searchKomoditas,
  getKomoditasById,
} from "../controllers/komoditasController.js";

const router = express.Router();

// GET /komoditas - List all komoditas
router.get("/", listKomoditas);

// GET /komoditas/search?q= - Search komoditas by nama
router.get("/search", searchKomoditas);

// GET /komoditas/:id - Get komoditas by ID
router.get("/:id", getKomoditasById);

export default router;
