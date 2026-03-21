import { sequelize, testConnection } from "./config/database.js";
import registerRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import sekAdmRoutes from "./routes/SEK-ADM.js";
import bdsHrgRoutes from "./routes/BDS-HRG.js";
import bktPgdRoutes from "./routes/BKT-PGD.js";
import modulesRoutes from "./routes/modules.js";
import bksEvlRoutes from "./routes/BKS-EVL.js";
// ...existing code...
// backend/server.js

import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import winston from "winston";
import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import client from "prom-client";
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

dotenv.config();

const app = express();
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

// ESM __filename shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  res.json({
    success: true,
    message: "SIGAP Malut API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
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

    app.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`SIGAP Malut Backend Server`);
      console.log(`${"=".repeat(60)}`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database: ${sequelize.getDialect()}`);
      console.log(`${"=".repeat(60)}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Export default untuk kebutuhan testing (misal supertest/mocha)
export default app;
