import { sequelize, testConnection } from "./config/database.js";
import registerRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import sekAdmRoutes from "./routes/SEK-ADM.js";
import bdsHrgRoutes from "./routes/BDS-HRG.js";
import bktPgdRoutes from "./routes/BKT-PGD.js";
import modulesRoutes from "./routes/modules.js";
import bksEvlRoutes from "./routes/BKS-EVL.js";
import dashboardRoutes from "./routes/dashboard.js";
import inflasiRoutes from "./routes/inflasi.js";
import komoditasStockRoutes from "./routes/komoditasStock.js";
import taskRoutes from "./routes/tasks.js";
import suratRoutes from "./routes/surat.js";
import notificationRoutes from "./routes/notification.js";
import mfaRoutes from "./routes/mfa.js";
import ePelaraRoutes from "./routes/ePelaraRoutes.js";
import bypassDetectionRoutes from "./routes/bypassDetection.js";
import subKegiatanUsulRoutes from "./routes/subKegiatanUsul.js";
import uptdOpsRoutes from "./routes/uptdOps.js";
import { initSLAScheduler } from "./services/slaService.js";
import { initDailyDigestScheduler } from "./services/dailyDigestService.js";
// ...existing code...
// backend/server.js

import http from "http";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import winston from "winston";
import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import client from "prom-client";
import { initSocketIOAsync } from "./services/socketService.js";
import {
  startKPIPolling,
  stopKPIPolling,
} from "./services/kpiPollingService.js";
import { getCacheStats } from "./services/cacheService.js";
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Eksplisit path agar dotenv selalu baca dari direktori server.js, bukan process.cwd()
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
import complianceRoutes from "./routes/compliance.js";

// Prometheus middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use("/api/compliance", complianceRoutes);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan request logger
app.use(morgan("dev"));

// Winston logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Example usage: logger.info("Server started");

// Serve master-data static files from repository root
app.use(
  "/master-data",
  express.static(path.join(__dirname, "..", "master-data")),
);

// Health check
app.get("/health", (req, res) => {
  const cacheStats = getCacheStats();
  res.json({
    success: true,
    message: "SIGAP Malut API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cache: cacheStats,
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    await sequelize.authenticate();

    // Get table count
    const [tables] = await sequelize.query(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
    );

    res.json({
      success: true,
      message: "Database connection successful",
      dialect: sequelize.getDialect(),
      tables: tables[0].count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Auth routes (harus sebelum registerRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/sek-adm", sekAdmRoutes);
app.use("/api/bds-hrg", bdsHrgRoutes);
app.use("/api/bkt-pgd", bktPgdRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/bks-evl", bksEvlRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inflasi", inflasiRoutes);
app.use("/api/komoditas", komoditasStockRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/surat", suratRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth/mfa", mfaRoutes);
app.use("/api/epelara", ePelaraRoutes);
app.use("/api/bypassdetection", bypassDetectionRoutes);
app.use("/api/sub-kegiatan-usul", subKegiatanUsulRoutes);
app.use("/api/uptd-ops", uptdOpsRoutes);

// Register all auto-generated routes
registerRoutes(app);

// Error handler

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Start server
async function startServer() {
  try {
    await testConnection();

    // Sync database models (only create tables if not exist)
    await sequelize.sync();

    // Inisialisasi Socket.IO
    await initSocketIOAsync(httpServer);

    // Mulai KPI polling (5 menit)
    startKPIPolling();

    // SLA escalation + daily digest schedulers
    await initSLAScheduler();
    await initDailyDigestScheduler();

    httpServer.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`SIGAP Malut Backend Server`);
      console.log(`${"=".repeat(60)}`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database: ${sequelize.getDialect()}`);
      console.log(`WebSocket: Socket.IO aktif di ws://localhost:${PORT}`);
      console.log(`KPI Polling: setiap 5 menit`);
      console.log(`SLA Scheduler: aktif`);
      console.log(`Daily Digest: aktif`);
      console.log(`${"=".repeat(60)}\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      stopKPIPolling();
      httpServer.close();
    });
    process.on("SIGINT", () => {
      stopKPIPolling();
      httpServer.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Export default untuk kebutuhan testing (misal supertest/mocha)
export default app;
