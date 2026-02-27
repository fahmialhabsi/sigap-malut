import { transition } from "../controllers/workflowController.js";
import engine from "../services/workflowEngine.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const wfDir = path.join(repoRoot, "backend", "workflows");
  await engine.loadFromDir(wfDir);

  const wfName = Array.from(engine.workflows.keys())[0];

  const req = {
    params: { workflowName: wfName },
    body: {
      to: "diajukan",
      entityId: 999,
      from: "draft",
      user: {
        id: 10,
        roles: ["creator"],
        permissions: [`workflow:${wfName}:submit`],
      },
    },
    app: { get: () => null },
  };

  const res = {
    status(code) {
      this._status = code;
      return this;
    },
    json(obj) {
      console.log("RESP", this._status || 200, JSON.stringify(obj));
    },
  };

  await transition(req, res).catch((e) => console.error("handler err", e));
}

run().catch((e) => console.error(e));
