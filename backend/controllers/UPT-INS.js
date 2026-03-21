import UptIns from "../models/UPT-INS.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptIns,
  getById: getUptInsById,
  create: createUptIns,
  update: updateUptIns,
  remove: deleteUptIns,
} = createUptdPilotController({
  model: UptIns,
  moduleCode: "UPT-INS",
  entityName: "UptIns",
});

export {
  getAllUptIns,
  getUptInsById,
  createUptIns,
  updateUptIns,
  deleteUptIns,
};
