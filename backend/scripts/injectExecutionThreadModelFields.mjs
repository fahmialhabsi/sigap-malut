import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.join(__dirname, "../models");

const block = `
  execution_thread_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Rantai eksekusi (execution thread)',
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Opsional: Tasks.id',
  },
`;

const files = [
  "SEK-ADM.js",
  "SEK-AST.js",
  "SEK-HUM.js",
  "SEK-KBJ.js",
  "SEK-KEP.js",
  "SEK-KEU.js",
  "SEK-LDS.js",
  "SEK-LKS.js",
  "SEK-LKT.js",
  "SEK-LUP.js",
  "SEK-REN.js",
  "SEK-RMH.js",
  "UPT-INS.js",
  "UPT-KEP.js",
  "UPT-KEU.js",
  "UPT-MTU.js",
  "UPT-TKN.js",
];

for (const f of files) {
  const p = path.join(modelsDir, f);
  let s = fs.readFileSync(p, "utf8");
  if (s.includes("execution_thread_id")) {
    console.log("skip exists", f);
    continue;
  }
  const re = /(\r?\n)(  created_by: \{[\s\S]*?comment: ['"]User ID['"],)/;
  if (!re.test(s)) {
    console.log("FAIL pattern", f);
    continue;
  }
  s = s.replace(re, `${block}$1$2`);
  fs.writeFileSync(p, s);
  console.log("patched", f);
}
