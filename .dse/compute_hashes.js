const fs = require("fs");
const crypto = require("crypto");
const files = {
  "config/serviceRegistry.json": "config/serviceRegistry.json",
  "backend/services/workflowEngine.js": "backend/services/workflowEngine.js",
};
const out = {};
for (const k of Object.keys(files)) {
  const p = files[k];
  const data = fs.readFileSync(p, "utf8");
  out[k] = crypto
    .createHash("sha256")
    .update(data, "utf8")
    .digest("hex")
    .toUpperCase();
}
fs.writeFileSync(".dse/file_hashes.json", JSON.stringify(out, null, 2), "utf8");
console.log("WROTE_HASHES");
