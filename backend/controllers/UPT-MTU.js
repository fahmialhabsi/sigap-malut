import UptMtu from "../models/UPT-MTU.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptMtu,
  getById: getUptMtuById,
  create: createUptMtu,
  update: updateUptMtu,
  remove: deleteUptMtu,
} = createUptdPilotController({
  model: UptMtu,
  moduleCode: "UPT-MTU",
  entityName: "UptMtu",
});

export {
  getAllUptMtu,
  getUptMtuById,
  createUptMtu,
  updateUptMtu,
  deleteUptMtu,
};
