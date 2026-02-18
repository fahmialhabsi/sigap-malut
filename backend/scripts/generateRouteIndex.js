import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_PATH = path.resolve(__dirname, "../routes");
const OUTPUT_FILE = path.resolve(__dirname, "../routes/index.js");

function generateRouteIndex() {
  console.log("🚀 Generating Route Index...\n");

  const routeFiles = fs
    .readdirSync(ROUTES_PATH)
    .filter((f) => f.endsWith(".js") && f !== "index.js")
    .sort();

  console.log(`📁 Found ${routeFiles.length} route files\n`);

  let code = `// =====================================================\n`;
  code += `// AUTO-GENERATED ROUTE INDEX\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// Total Routes: ${routeFiles.length}\n`;
  code += `// =====================================================\n\n`;

  // Imports
  routeFiles.forEach((file) => {
    const modulId = file.replace(".js", "");
    const varName = modulId.replace(/-/g, "");
    code += `import ${varName}Routes from './${modulId}.js';\n`;
  });

  code += `\n`;
  code += `export default function registerRoutes(app) {\n`;
  code += `  console.log('📡 Registering API routes...\\n');\n\n`;

  // Register routes
  routeFiles.forEach((file) => {
    const modulId = file.replace(".js", "");
    const varName = modulId.replace(/-/g, "");
    const routePath = modulId.toLowerCase();
    code += `  app.use('/api/${routePath}', ${varName}Routes);\n`;
  });

  code += `\n`;
  code += `  console.log('✅ ${routeFiles.length} API routes registered\\n');\n`;
  code += `}\n`;

  fs.writeFileSync(OUTPUT_FILE, code);

  console.log(`✅ Generated: routes/index.js`);
  console.log(`📊 Total routes: ${routeFiles.length}\n`);
}

generateRouteIndex();
