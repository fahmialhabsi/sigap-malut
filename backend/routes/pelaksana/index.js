// backend/routes/pelaksana/index.js
// Mount semua Pelaksana routes

import express from "express";
import dashboardRoutes from "./dashboardRoutes.js";
import tugasRoutes from "./tugasRoutes.js";
import spjRoutes from "./spjRoutes.js";

const router = express.Router();

// /api/pelaksana/dashboard/*
router.use("/dashboard", dashboardRoutes);

router.use('/tugas', tugasRoutes);
router.use('/spj', spjRoutes);
// router.use('/absensi', absensiRoutes);

export default router;
