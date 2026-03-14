// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "./config/database.js";
import registerRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = Number.parseInt(process.env.PORT || "5000", 10) || 5000;
const MAX_PORT_RETRIES = 10;
const isDevelopment = process.env.NODE_ENV === "development";
const enableStartupLogs =
  process.env.STARTUP_LOGGING !== "false" && process.env.NODE_ENV !== "test";

// ESM __dirname shim
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

// Serve master-data static files from repository root
app.use(
  "/master-data",
  express.static(path.join(__dirname, "..", "master-data")),
);

// Request logging (development only)
if (isDevelopment) {
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
    const dialect = sequelize.getDialect();
    let tableCount = 0;

    if (dialect === "sqlite") {
      const [tables] = await sequelize.query(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
      );
      tableCount = Number(tables?.[0]?.count || 0);
    } else if (dialect === "postgres") {
      const [tables] = await sequelize.query(
        "SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';",
      );
      tableCount = Number(tables?.[0]?.count || 0);
    }

    res.json({
      success: true,
      message: "Database connection successful",
      dialect,
      tables: tableCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Single route entry point
registerRoutes(app);

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

function listen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);

    const handleListening = () => {
      server.off("error", handleError);
      resolve(server);
    };

    const handleError = (error) => {
      server.off("listening", handleListening);
      reject(error);
    };

    server.once("listening", handleListening);
    server.once("error", handleError);
  });
}

async function listenWithFallback(startPort) {
  let currentPort = startPort;
  const maxAttempts = isDevelopment ? MAX_PORT_RETRIES : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const server = await listen(currentPort);

      if (attempt > 0) {
        console.warn(
          `Port ${startPort} is in use. Backend running on port ${currentPort}.`,
        );
      }

      return { server, port: currentPort };
    } catch (error) {
      if (error.code !== "EADDRINUSE" || attempt === maxAttempts - 1) {
        throw error;
      }

      currentPort += 1;
    }
  }

  throw new Error(
    `Unable to bind backend server after ${maxAttempts} attempts starting from port ${startPort}.`,
  );
}

// Start server
async function startServer() {
  try {
    if (enableStartupLogs) {
      console.log(`Database connected (${sequelize.getDialect()}).`);
    }

    // Sync database models (only create tables if not exist)
    await sequelize.sync();

    const { port } = await listenWithFallback(PORT);

    if (enableStartupLogs) {
      const envName = process.env.NODE_ENV || "development";
      console.log(`Server running on http://localhost:${port} (${envName}).`);
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
