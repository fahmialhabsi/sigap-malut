import UptKeu from "../models/UPT-KEU.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptKeu,
  getById: getUptKeuById,
  create: createUptKeu,
  update: updateUptKeu,
  remove: deleteUptKeu,
} = createUptdPilotController({
  model: UptKeu,
  moduleCode: "UPT-KEU",
  entityName: "UptKeu",
});

export {
  getAllUptKeu,
  getUptKeuById,
  createUptKeu,
  updateUptKeu,
  deleteUptKeu,
};
