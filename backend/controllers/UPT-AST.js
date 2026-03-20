import UptAst from "../models/UPT-AST.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptAst,
  getById: getUptAstById,
  create: createUptAst,
  update: updateUptAst,
  remove: deleteUptAst,
} = createUptdPilotController({
  model: UptAst,
  moduleCode: "UPT-AST",
  entityName: "UptAst",
});

export {
  getAllUptAst,
  getUptAstById,
  createUptAst,
  updateUptAst,
  deleteUptAst,
};
