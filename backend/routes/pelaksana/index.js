// backend/routes/pelaksana/index.js
// Mount semua Pelaksana routes

import express from "express";
import dashboardRoutes from "./dashboardRoutes.js";

const router = express.Router();

// /api/pelaksana/dashboard/*
router.use("/dashboard", dashboardRoutes);

router.use('/tugas', tugasRoutes);  \nimport spjRoutes from './spjRoutes.js';  \nrouter.use('/spj', spjRoutes);
// router.use('/absensi', absensiRoutes);

export default router;
