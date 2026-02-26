import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTROLLERS_PATH = path.resolve(__dirname, "../controllers");
const ROUTES_OUTPUT_PATH = path.resolve(__dirname, "../routes");

function toPascalCase(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function generateRoute(controllerFile) {
  const modulId = controllerFile.replace(".js", "");
  const modelName = toPascalCase(modulId.replace(/-/g, "_"));
  const routePath = modulId.toLowerCase();

  let code = `// =====================================================\n`;
  code += `// ROUTES: ${modelName}\n`;
  code += `// Base Path: /api/${routePath}\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// =====================================================\n\n`;

  code += `import express from 'express';\n`;
  code += `import {\n`;
  code += `  getAll${modelName},\n`;
  code += `  get${modelName}ById,\n`;
  code += `  create${modelName},\n`;
  code += `  update${modelName},\n`;
  code += `  delete${modelName}\n`;
  code += `} from '../controllers/${modulId}.js';\n`;
  code += `// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready\n\n`;

  code += `const router = express.Router();\n\n`;

  code += `// All routes are protected (uncomment when auth is ready)\n`;
  code += `// router.use(protect);\n\n`;

  code += `router.route('/')\n`;
  code += `  .get(getAll${modelName})\n`;
  code += `  .post(create${modelName});\n\n`;

  code += `router.route('/:id')\n`;
  code += `  .get(get${modelName}ById)\n`;
  code += `  .put(update${modelName})\n`;
  code += `  .delete(delete${modelName});\n\n`;

  code += `export default router;\n`;

  return code;
}

async function main() {
  console.log("🚀 Starting Routes Generation...\n");

  if (!fs.existsSync(CONTROLLERS_PATH)) {
    console.error(
      "❌ Controllers directory not found! Run generateControllers.js first.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(ROUTES_OUTPUT_PATH)) {
    fs.mkdirSync(ROUTES_OUTPUT_PATH, { recursive: true });
    console.log(`✅ Created output directory: ${ROUTES_OUTPUT_PATH}\n`);
  }

  const controllerFiles = fs
    .readdirSync(CONTROLLERS_PATH)
    .filter((f) => f.endsWith(".js"));

  console.log(`📁 Found ${controllerFiles.length} controllers\n`);

  let totalRoutes = 0;

  for (const controllerFile of controllerFiles) {
    try {
      const code = generateRoute(controllerFile);
      const outputFile = path.join(ROUTES_OUTPUT_PATH, controllerFile);
      fs.writeFileSync(outputFile, code);

      console.log(`  ✅ Generated: ${controllerFile}`);
      totalRoutes++;
    } catch (error) {
      console.error(
        `  ❌ Error generating route for ${controllerFile}:`,
        error.message,
      );
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Routes generation complete!`);
  console.log(`📊 Total routes generated: ${totalRoutes}`);
  console.log(`📂 Output directory: ${ROUTES_OUTPUT_PATH}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
