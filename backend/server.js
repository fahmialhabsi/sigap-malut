import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
// Project modules will be dynamically imported inside startServer()
let sequelize;
let testConnection;
let initModels;
let registerRoutes;
let authRoutes;
let sekAdmRoutes;
let bdsHrgRoutes;
let bktPgdRoutes;
let tablesRoutes;
let modulesRoutes;
let workflowRouter;
let workflowStatusRouter;

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

// Note: DB routes and other project route registrations are performed
// inside startServer() after dynamic imports so startup logs can be muted.
// The global 404 and error handlers are registered at the end of startServer()
// after all routes are mounted so they don't preempt dynamic routes.

// Start server
async function startServer() {
  let originalConsole;
  try {
    // Mute console during dynamic imports and DB initialization so
    // only the final server start messages are printed.
    originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
    const noop = () => {};
    console.log =
      console.info =
      console.warn =
      console.error =
      console.debug =
        noop;

    // Dynamic imports of project modules (avoid import-time logs)
    ({ sequelize, testConnection } = await import("./config/database.js"));
    ({ initModels } = await import("./models/index.js"));
    ({ default: registerRoutes } = await import("./routes/index.js"));
    ({ default: authRoutes } = await import("./routes/auth.js"));
    ({ default: sekAdmRoutes } = await import("./routes/SEK-ADM.js"));
    ({ default: bdsHrgRoutes } = await import("./routes/BDS-HRG.js"));
    ({ default: bktPgdRoutes } = await import("./routes/BKT-PGD.js"));
    ({ default: tablesRoutes } = await import("./routes/tables.js"));
    ({ default: modulesRoutes } = await import("./routes/modules.js"));
    ({ default: workflowRouter } = await import("./routes/workflow.js"));
    ({ default: workflowStatusRouter } =
      await import("./routes/workflow-status.js"));

    // Register routes (auth & others)
    app.use("/api/auth", authRoutes);
    app.use("/api/sek-adm", sekAdmRoutes);
    app.use("/api/bds-hrg", bdsHrgRoutes);
    app.use("/api/bkt-pgd", bktPgdRoutes);
    app.use("/api/modules", modulesRoutes);

    // Register all auto-generated routes
    registerRoutes(app);

    // Dynamic table routes (must be after specific routes)
    app.use("/api/workflow-status", workflowStatusRouter);
    app.use("/api", tablesRoutes);
    app.use("/api/workflows", workflowRouter);

    // Test database connection route (now that sequelize is available)
    app.get("/api/test-db", async (req, res) => {
      try {
        await sequelize.authenticate();
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

    // Initialize and sync database models (only create tables if not exist)
    await testConnection();
    // `initModels` returns the models registry — capture and attach to app
    const models = await initModels(sequelize);
    // Make models and sequelize instance available to controllers
    app.set("models", models);
    app.set("sequelize", sequelize);
    await sequelize.sync();

    // Register 404 and error handlers after all routes so they do not
    // intercept valid route requests (fixes premature 404 responses).
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
      });
    });

    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Restore console and print only the server start output
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;

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
    // Restore console to ensure we can see the error
    if (originalConsole) {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
    }
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Only start server when not running tests
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app, startServer };
