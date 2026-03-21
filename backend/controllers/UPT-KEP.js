import UptKep from "../models/UPT-KEP.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptKep,
  getById: getUptKepById,
  create: createUptKep,
  update: updateUptKep,
  remove: deleteUptKep,
} = createUptdPilotController({
  model: UptKep,
  moduleCode: "UPT-KEP",
  entityName: "UptKep",
});

export {
  getAllUptKep,
  getUptKepById,
  createUptKep,
  updateUptKep,
  deleteUptKep,
};
