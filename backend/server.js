import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { sequelize, testConnection } from "./config/database.js";
import registerRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import sekAdmRoutes from "./routes/SEK-ADM.js";
import bdsHrgRoutes from "./routes/BDS-HRG.js";
import bktPgdRoutes from "./routes/BKT-PGD.js";
import tablesRoutes from "./routes/tables.js";
import modulesRoutes from "./routes/modules.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

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

// Register all auto-generated routes
registerRoutes(app);

// Dynamic table routes (must be after specific routes)
app.use("/api", tablesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
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
      console.log(`🚀 SIGAP Malut Backend Server`);
      console.log(`${"=".repeat(60)}`);
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`💾 Database: ${sequelize.getDialect()}`);
      console.log(`${"=".repeat(60)}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
