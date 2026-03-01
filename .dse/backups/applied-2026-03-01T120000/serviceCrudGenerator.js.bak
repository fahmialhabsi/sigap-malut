const fs = require("fs");
const path = require("path");

/**
 * serviceCrudGenerator
 * - reads config/serviceRegistry.json
 * - generates Sequelize model file skeleton under backend/models/
 * - generates simple controller and route skeleton under backend/controllers and backend/routes
 * - NOTE: This generator writes skeletal files that must be integrated into app.
 */
async function generate(projectRoot) {
  const registryPath = path.join(projectRoot, "config", "serviceRegistry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const modelsDir = path.join(projectRoot, "backend", "models");
  const controllersDir = path.join(projectRoot, "backend", "controllers");
  const routesDir = path.join(projectRoot, "backend", "routes");
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
  if (!fs.existsSync(controllersDir))
    fs.mkdirSync(controllersDir, { recursive: true });
  if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

  registry.forEach((svc) => {
    const code = svc.kode_layanan.toLowerCase();
    const modelFile = path.join(modelsDir, `${code}.js`);
    const controllerFile = path.join(controllersDir, `${code}Controller.js`);
    const routeFile = path.join(routesDir, `${code}.js`);

    if (!fs.existsSync(modelFile)) {
      fs.writeFileSync(
        modelFile,
        `module.exports = (sequelize, DataTypes) => {
  const ${code} = sequelize.define('${code}', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: '${code}' });
  return ${code};
};
`,
      );
    }

    if (!fs.existsSync(controllerFile)) {
      fs.writeFileSync(
        controllerFile,
        `const BaseService = require('../services/baseService');
module.exports = function(models){
  const svc = new BaseService(models['${code}']);
  return {
    create: async (req,res,next)=>{ try{ const r=await svc.create(req.body); return res.json(r);}catch(e){next(e)} },
    list: async (req,res,next)=>{ try{ const r=await svc.findAll(); return res.json(r);}catch(e){next(e)} },
    get: async (req,res,next)=>{ try{ const r=await svc.findById(req.params.id); return res.json(r);}catch(e){next(e)} }
  }
}
`,
      );
    }

    if (!fs.existsSync(routeFile)) {
      fs.writeFileSync(
        routeFile,
        `const express = require('express');
const router = express.Router();
module.exports = (app) => {
  const models = app.get('models');
  const ctrl = require('../controllers/${code}Controller')(models);
  router.post('/', ctrl.create);
  router.get('/', ctrl.list);
  router.get('/:id', ctrl.get);
  return router;
};
`,
      );
    }
  });
  return { generated: registry.map((r) => r.kode_layanan) };
}

if (require.main === module) {
  const projectRoot = path.resolve(__dirname, "..", "..");
  generate(projectRoot)
    .then((r) => console.log("generated", r))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { generate };
