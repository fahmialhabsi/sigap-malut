const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "../backend/models");
const files = fs
  .readdirSync(dir)
  .filter((x) => x.endsWith(".js") && x !== "index.js");
for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const m = src.match(/sequelize\.define\(['"`](\w+)['"`]/);
  console.log(f, "=>", m ? m[1] : "NO");
}
