import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modules = [];
const pagesDir = path.join(__dirname, "../src/pages/generated");
const routesFile = path.join(__dirname, "../src/routes/generatedRoutes.jsx");

// Create pages directory
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Read CSV
fs.createReadStream(
  path.join(__dirname, "../../master-data/00_MASTER_MODUL_CONFIG.csv"),
)
  .pipe(csv())
  .on("data", (row) => {
    if (row.modul_id && row.is_active === "true") {
      modules.push(row);
    }
  })
  .on("end", () => {
    console.log(`📦 Found ${modules.length} active modules`);

    let imports = "";
    let routes = "";

    modules.forEach((mod) => {
      const moduleName = mod.modul_id.replace(/-/g, "");
      const endpoint = `/${mod.tabel_name}`;

      // Generate List Page
      const listPage = `import BaseTable from '../../components/base/BaseTable';

export default function ${moduleName}ListPage() {
  return (
    <BaseTable 
      endpoint="${endpoint}"
      title="${mod.nama_modul}"
      icon="${mod.icon}"
      moduleId="${mod.modul_id.toLowerCase()}"
    />
  );
}
`;

      fs.writeFileSync(
        path.join(pagesDir, `${moduleName}ListPage.jsx`),
        listPage,
      );

      // Add to imports
      imports += `import ${moduleName}ListPage from '../pages/generated/${moduleName}ListPage';\n`;

      // Add to routes with key prop
      routes += `    <Route key="${mod.modul_id.toLowerCase()}" path="/module/${mod.modul_id.toLowerCase()}" element={<PrivateRoute><${moduleName}ListPage /></PrivateRoute>} />,\n`;
    });

    // Generate routes file - return array of Routes
    const routesContent = `import { Route } from 'react-router-dom';
${imports}
export default function GeneratedRoutes({ PrivateRoute }) {
  return [
${routes}  ];
}
`;

    fs.writeFileSync(routesFile, routesContent);

    console.log(`✅ Generated ${modules.length} list pages`);
    console.log(`✅ Generated routes file`);
  });
