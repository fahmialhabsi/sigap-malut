import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const modelDir = path.join(process.cwd(), "backend", "models");
const files = fs.readdirSync(modelDir).filter((f) => f.endsWith(".js"));
let hadError = false;
(async () => {
  for (const f of files) {
    const p = path.join(modelDir, f);
    try {
      await import(pathToFileURL(p).href);
      console.log("[ok] ", f);
    } catch (err) {
      hadError = true;
      console.error(
        "[error]",
        f,
        err && err.stack ? err.stack.split("\n")[0] : err,
      );
    }
  }
  process.exit(hadError ? 1 : 0);
})();
