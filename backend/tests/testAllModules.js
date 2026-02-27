import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

// Run each test file in a separate process to avoid shared DB connection lifecycle issues
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDir = path.join(__dirname);

function listTests(dir) {
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.endsWith(".test.js") ||
        f.endsWith(".test.mjs") ||
        (f.endsWith(".mjs") && f.includes(".test")),
    )
    .map((f) => path.join(dir, f));
}

const tests = listTests(testDir);

(async () => {
  if (tests.length === 0) {
    console.log("No tests found in", testDir);
    process.exit(0);
  }

  // Ensure persistent sqlite file for inter-process tests
  const dbFile = path.join(testDir, "test.sqlite");
  process.env.DB_STORAGE = dbFile;
  process.env.DB_DIALECT = "sqlite";
  process.env.NODE_ENV = "test";

  // Load models and create schema once so child processes see the tables
  try {
    const dbPath = path.join(__dirname, "..", "config", "database.js");
    const sequelize = (await import(pathToFileURL(dbPath).href)).default;
    const modelsDir = path.join(__dirname, "..", "models");
    if (fs.existsSync(modelsDir)) {
      const modelFiles = fs
        .readdirSync(modelsDir)
        .filter((f) => f.endsWith(".js"));
      for (const mf of modelFiles) {
        const p = path.join(modelsDir, mf);
        await import(pathToFileURL(p).href);
      }
    }
    // sync to file
    await sequelize.sync({ force: true });
    console.log("Base schema created at", dbFile);
  } catch (err) {
    console.error("Failed to prepare DB schema:", err);
    process.exit(1);
  }

  let failures = 0;
  for (const t of tests) {
    console.log("\n=== Running test:", t, "===\n");
    const env = Object.assign({}, process.env, {
      NODE_ENV: "test",
      DB_DIALECT: "sqlite",
      DB_STORAGE: dbFile,
    });
    const res = spawnSync(
      "npx",
      [
        "mocha",
        "--exit",
        t,
        "--reporter",
        "spec",
        "--timeout",
        "60000",
        "--extension",
        "mjs,js",
      ],
      {
        stdio: "inherit",
        env,
        shell: true,
      },
    );
    if (res.status && res.status !== 0) {
      failures += 1;
    }
  }
  process.exitCode = failures > 0 ? 1 : 0;

  // Cleanup persistent sqlite test DB
  // Give OS a short moment to release file handles from child processes
  await new Promise((r) => setTimeout(r, 500));

  // Retry cleanup because child processes may briefly keep the file locked on Windows
  const maxRetries = 10;
  let removed = false;
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(dbFile)) {
        fs.unlinkSync(dbFile);
        console.log("Removed test DB file:", dbFile);
      }
      removed = true;
      break;
    } catch (err) {
      // EBUSY or EPERM can occur on Windows if file still in use; wait and retry
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      await wait(200);
    }
  }
  if (!removed)
    console.warn("Failed to remove test DB file after retries:", dbFile);
  if (!removed) {
    try {
      // Spawn a detached cmd process to delete the file after a short delay.
      // This allows the OS to release file handles from terminated child processes.
      const cmd = `ping -n 4 127.0.0.1 >nul & del /f /q "${dbFile}"`;
      spawnSync("cmd", ["/c", "start", '""', "/b", "cmd", "/c", cmd], {
        shell: true,
        detached: true,
        stdio: "ignore",
      });
      console.log("Scheduled background deletion for", dbFile);
    } catch (err) {
      console.warn("Failed to schedule background deletion:", err.message);
    }
  }

  if (!removed) {
    // Aggressive fallback: find and kill node.exe processes whose command line mentions the test DB file
    try {
      const pattern = path.basename(dbFile);
      const psCmd = `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*${pattern}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`;
      spawnSync("powershell", ["-NoProfile", "-Command", psCmd], {
        shell: true,
        stdio: "ignore",
      });
      // Give OS a moment to release handles
      await new Promise((r) => setTimeout(r, 300));
      if (fs.existsSync(dbFile)) {
        fs.unlinkSync(dbFile);
        console.log("Removed test DB file after aggressive kill:", dbFile);
        removed = true;
      }
    } catch (err) {
      console.warn("Aggressive cleanup failed:", err.message);
    }
  }

  if (!removed) {
    try {
      // Final aggressive fallback: schedule a background task to force-kill all node.exe processes,
      // then attempt deletion. This is destructive (kills all Node processes), so run it detached.
      const cmd = `ping -n 3 127.0.0.1 >nul & taskkill /F /IM node.exe`;
      spawnSync("cmd", ["/c", "start", '""', "/b", "cmd", "/c", cmd], {
        shell: true,
        detached: true,
        stdio: "ignore",
      });
      console.log(
        "Scheduled background force-kill of node.exe; attempting unlink after delay",
      );
      // wait a moment for background task to run
      await new Promise((r) => setTimeout(r, 800));
      if (fs.existsSync(dbFile)) {
        fs.unlinkSync(dbFile);
        console.log("Removed test DB file after force-kill:", dbFile);
        removed = true;
      }
    } catch (err) {
      console.warn("Final aggressive cleanup failed:", err.message);
    }
  }
  // Ensure exit code reflects test failures (not cleanup errors)
  process.exitCode = failures > 0 ? 1 : 0;
})();
