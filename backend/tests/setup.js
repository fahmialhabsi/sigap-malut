import { sequelize } from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Test bootstrap: ensure DB connection and sync models before running tests
console.log("⏳ Test setup: authenticating DB and syncing models...");
try {
  await sequelize.authenticate();

  // Import all model files so they register with sequelize
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modelsDir = path.resolve(__dirname, "..", "models");
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith(".js"));
    for (const f of files) {
      const p = path.join(modelsDir, f);
      try {
        await import(pathToFileURL(p).href);
      } catch (e) {
        // continue if a model fails to import
        console.warn("warning importing model", p, e.message);
      }
    }
  }

  await sequelize.sync();
  console.log("✅ Test DB ready (sequelize.sync completed)");
} catch (e) {
  console.error("❌ Test DB setup failed:", e);
  process.exit(1);
}
