import UptTkn from "../models/UPT-TKN.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptTkn,
  getById: getUptTknById,
  create: createUptTkn,
  update: updateUptTkn,
  remove: deleteUptTkn,
} = createUptdPilotController({
  model: UptTkn,
  moduleCode: "UPT-TKN",
  entityName: "UptTkn",
});

export {
  getAllUptTkn,
  getUptTknById,
  createUptTkn,
  updateUptTkn,
  deleteUptTkn,
};
