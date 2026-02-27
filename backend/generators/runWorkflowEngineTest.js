import engine from "../services/workflowEngine.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const wfDir = path.join(repoRoot, "backend", "workflows");
  await engine.loadFromDir(wfDir);

  const workflowNames = Array.from(engine.workflows.keys());
  console.log("Loaded workflows:", workflowNames.slice(0, 10));

  // Pick one workflow from loaded set
  const wfName = workflowNames[0];
  if (!wfName) {
    console.log("No workflows loaded, aborting test.");
    return;
  }

  const mockEntity = { id: 123, status: "draft", data: { foo: "bar" } };
  const mockUser = {
    id: 7,
    roles: ["creator"],
    permissions: [`workflow:${wfName}:submit`],
  };

  try {
    const result = await engine.performTransition({
      workflowName: wfName,
      entity: mockEntity,
      to: "diajukan",
      user: mockUser,
    });
    console.log("Transition succeeded, new status:", result.status);
  } catch (err) {
    console.error("Transition failed:", err.message, err.meta || "");
  }
}

if (process.env.NODE_ENV !== "test") {
  run().catch((e) => console.error(e));
}
