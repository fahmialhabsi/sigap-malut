import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_PATH = path.resolve(__dirname, "../models");
const CONTROLLERS_OUTPUT_PATH = path.resolve(__dirname, "../controllers");

function toPascalCase(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function generateController(modelFile) {
  const modulId = modelFile.replace(".js", "");
  const modelName = toPascalCase(modulId.replace(/-/g, "_"));
  const controllerName = `${modelName}Controller`;

  let code = `// =====================================================\n`;
  code += `// CONTROLLER: ${controllerName}\n`;
  code += `// MODEL: ${modelName}\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// =====================================================\n\n`;

  code += `import ${modelName} from '../models/${modulId}.js';\n\n`;

  // GET ALL
  code += `// @desc    Get all ${modelName} records\n`;
  code += `// @route   GET /api/${modulId.toLowerCase()}\n`;
  code += `// @access  Private\n`;
  code += `export const getAll${modelName} = async (req, res) => {\n`;
  code += `  try {\n`;
  code += `    const { page = 1, limit = 10, search, ...filters } = req.query;\n`;
  code += `    \n`;
  code += `    const offset = (page - 1) * limit;\n`;
  code += `    \n`;
  code += `    const where = { ...filters };\n`;
  code += `    \n`;
  code += `    const { count, rows } = await ${modelName}.findAndCountAll({\n`;
  code += `      where,\n`;
  code += `      limit: parseInt(limit),\n`;
  code += `      offset: parseInt(offset),\n`;
  code += `      order: [['created_at', 'DESC']]\n`;
  code += `    });\n`;
  code += `    \n`;
  code += `    res.json({\n`;
  code += `      success: true,\n`;
  code += `      data: rows,\n`;
  code += `      pagination: {\n`;
  code += `        total: count,\n`;
  code += `        page: parseInt(page),\n`;
  code += `        limit: parseInt(limit),\n`;
  code += `        totalPages: Math.ceil(count / limit)\n`;
  code += `      }\n`;
  code += `    });\n`;
  code += `  } catch (error) {\n`;
  code += `    res.status(500).json({\n`;
  code += `      success: false,\n`;
  code += `      message: 'Error fetching ${modelName}',\n`;
  code += `      error: error.message\n`;
  code += `    });\n`;
  code += `  }\n`;
  code += `};\n\n`;

  // GET BY ID
  code += `// @desc    Get single ${modelName} by ID\n`;
  code += `// @route   GET /api/${modulId.toLowerCase()}/:id\n`;
  code += `// @access  Private\n`;
  code += `export const get${modelName}ById = async (req, res) => {\n`;
  code += `  try {\n`;
  code += `    const record = await ${modelName}.findByPk(req.params.id);\n`;
  code += `    \n`;
  code += `    if (!record) {\n`;
  code += `      return res.status(404).json({\n`;
  code += `        success: false,\n`;
  code += `        message: '${modelName} not found'\n`;
  code += `      });\n`;
  code += `    }\n`;
  code += `    \n`;
  code += `    res.json({\n`;
  code += `      success: true,\n`;
  code += `      data: record\n`;
  code += `    });\n`;
  code += `  } catch (error) {\n`;
  code += `    res.status(500).json({\n`;
  code += `      success: false,\n`;
  code += `      message: 'Error fetching ${modelName}',\n`;
  code += `      error: error.message\n`;
  code += `    });\n`;
  code += `  }\n`;
  code += `};\n\n`;

  // CREATE
  code += `// @desc    Create new ${modelName}\n`;
  code += `// @route   POST /api/${modulId.toLowerCase()}\n`;
  code += `// @access  Private\n`;
  code += `export const create${modelName} = async (req, res) => {\n`;
  code += `  try {\n`;
  code += `    const record = await ${modelName}.create({\n`;
  code += `      ...req.body,\n`;
  code += `      created_by: req.user?.id\n`;
  code += `    });\n`;
  code += `    \n`;
  code += `    res.status(201).json({\n`;
  code += `      success: true,\n`;
  code += `      message: '${modelName} created successfully',\n`;
  code += `      data: record\n`;
  code += `    });\n`;
  code += `  } catch (error) {\n`;
  code += `    res.status(400).json({\n`;
  code += `      success: false,\n`;
  code += `      message: 'Error creating ${modelName}',\n`;
  code += `      error: error.message\n`;
  code += `    });\n`;
  code += `  }\n`;
  code += `};\n\n`;

  // UPDATE
  code += `// @desc    Update ${modelName}\n`;
  code += `// @route   PUT /api/${modulId.toLowerCase()}/:id\n`;
  code += `// @access  Private\n`;
  code += `export const update${modelName} = async (req, res) => {\n`;
  code += `  try {\n`;
  code += `    const record = await ${modelName}.findByPk(req.params.id);\n`;
  code += `    \n`;
  code += `    if (!record) {\n`;
  code += `      return res.status(404).json({\n`;
  code += `        success: false,\n`;
  code += `        message: '${modelName} not found'\n`;
  code += `      });\n`;
  code += `    }\n`;
  code += `    \n`;
  code += `    await record.update({\n`;
  code += `      ...req.body,\n`;
  code += `      updated_by: req.user?.id\n`;
  code += `    });\n`;
  code += `    \n`;
  code += `    res.json({\n`;
  code += `      success: true,\n`;
  code += `      message: '${modelName} updated successfully',\n`;
  code += `      data: record\n`;
  code += `    });\n`;
  code += `  } catch (error) {\n`;
  code += `    res.status(400).json({\n`;
  code += `      success: false,\n`;
  code += `      message: 'Error updating ${modelName}',\n`;
  code += `      error: error.message\n`;
  code += `    });\n`;
  code += `  }\n`;
  code += `};\n\n`;

  // DELETE
  code += `// @desc    Delete ${modelName}\n`;
  code += `// @route   DELETE /api/${modulId.toLowerCase()}/:id\n`;
  code += `// @access  Private\n`;
  code += `export const delete${modelName} = async (req, res) => {\n`;
  code += `  try {\n`;
  code += `    const record = await ${modelName}.findByPk(req.params.id);\n`;
  code += `    \n`;
  code += `    if (!record) {\n`;
  code += `      return res.status(404).json({\n`;
  code += `        success: false,\n`;
  code += `        message: '${modelName} not found'\n`;
  code += `      });\n`;
  code += `    }\n`;
  code += `    \n`;
  code += `    await record.destroy();\n`;
  code += `    \n`;
  code += `    res.json({\n`;
  code += `      success: true,\n`;
  code += `      message: '${modelName} deleted successfully'\n`;
  code += `    });\n`;
  code += `  } catch (error) {\n`;
  code += `    res.status(500).json({\n`;
  code += `      success: false,\n`;
  code += `      message: 'Error deleting ${modelName}',\n`;
  code += `      error: error.message\n`;
  code += `    });\n`;
  code += `  }\n`;
  code += `};\n`;

  return code;
}

async function main() {
  console.log("🚀 Starting Controller Generation...\n");

  if (!fs.existsSync(MODELS_PATH)) {
    console.error(
      "❌ Models directory not found! Run generateModels.js first.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(CONTROLLERS_OUTPUT_PATH)) {
    fs.mkdirSync(CONTROLLERS_OUTPUT_PATH, { recursive: true });
    console.log(`✅ Created output directory: ${CONTROLLERS_OUTPUT_PATH}\n`);
  }

  const modelFiles = fs
    .readdirSync(MODELS_PATH)
    .filter((f) => f.endsWith(".js"));

  console.log(`📁 Found ${modelFiles.length} models\n`);

  let totalControllers = 0;

  for (const modelFile of modelFiles) {
    try {
      const code = generateController(modelFile);
      const outputFile = path.join(CONTROLLERS_OUTPUT_PATH, modelFile);
      fs.writeFileSync(outputFile, code);

      console.log(`  ✅ Generated: ${modelFile}`);
      totalControllers++;
    } catch (error) {
      console.error(
        `  ❌ Error generating controller for ${modelFile}:`,
        error.message,
      );
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Controller generation complete!`);
  console.log(`📊 Total controllers generated: ${totalControllers}`);
  console.log(`📂 Output directory: ${CONTROLLERS_OUTPUT_PATH}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
