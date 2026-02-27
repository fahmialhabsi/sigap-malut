import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, "..", "..");
  const registryPath = path.join(repoRoot, "config", "serviceRegistry.json");
  const outDir = path.join(repoRoot, "backend", "workflows");

  try {
    await fs.mkdir(outDir, { recursive: true });
    const raw = await fs.readFile(registryPath, "utf8");
    const services = JSON.parse(raw);
    const workflows = new Set();

    for (const s of services) {
      if (s && s.workflow && typeof s.workflow === "string")
        workflows.add(s.workflow);
    }

    if (workflows.size === 0) {
      console.log("No workflow keys found in", registryPath);
      process.exit(0);
    }

    const defaultTemplate = (name) => {
      const base = {
        name,
        description: `Auto-generated workflow for ${name}`,
        states: [
          "draft",
          "diajukan",
          "diverifikasi",
          "disetujui",
          "selesai",
          "arsip",
        ],
        // transitions now include role & permission guards and audit/notify metadata
        transitions: [
          {
            from: "draft",
            to: "diajukan",
            allowedRoles: ["creator"],
            requiredPermissions: [`workflow:${name}:submit`],
            audit: true,
            notify: ["reviewer"],
          },
          {
            from: "diajukan",
            to: "diverifikasi",
            allowedRoles: ["reviewer"],
            requiredPermissions: [`workflow:${name}:verify`],
            audit: true,
            notify: ["approver"],
          },
          {
            from: "diverifikasi",
            to: "disetujui",
            allowedRoles: ["approver"],
            requiredPermissions: [`workflow:${name}:approve`],
            audit: true,
            notify: ["creator"],
          },
          {
            from: "disetujui",
            to: "selesai",
            allowedRoles: ["approver"],
            requiredPermissions: [`workflow:${name}:complete`],
            audit: true,
          },
          {
            from: "*",
            to: "arsip",
            allowedRoles: ["admin"],
            requiredPermissions: ["workflow:archive"],
            audit: true,
          },
        ],
        roles: {
          creator: ["creator"],
          reviewer: ["reviewer"],
          approver: ["approver"],
          admin: ["admin"],
        },
        metadata: {
          audit_enabled: true,
          notify_on_transition: true,
        },
      };

      return base;
    };

    for (const wf of workflows) {
      const filename = path.join(outDir, `${wf}.json`);
      try {
        const force = process.env.FORCE === "1";
        const exists = await fs
          .stat(filename)
          .then(() => true)
          .catch(() => false);
        if (exists && !force) {
          console.log("Skipping existing workflow file:", filename);
          continue;
        }

        const content = JSON.stringify(defaultTemplate(wf), null, 2);
        await fs.writeFile(filename, content, "utf8");
        console.log("Wrote workflow:", filename);
      } catch (err) {
        console.error("Failed to write workflow", wf, err.message);
      }
    }

    console.log("Done. Generated", workflows.size, "workflow files in", outDir);
  } catch (err) {
    console.error("Error generating workflows:", err.message);
    process.exit(1);
  }
}

// run
main();
