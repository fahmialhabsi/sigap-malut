import UptAdm from "../models/UPT-ADM.js";
import { createUptdPilotController } from "./createUptdPilotController.js";

const {
  getAll: getAllUptAdm,
  getById: getUptAdmById,
  create: createUptAdm,
  update: updateUptAdm,
  remove: deleteUptAdm,
} = createUptdPilotController({
  model: UptAdm,
  moduleCode: "UPT-ADM",
  entityName: "UptAdm",
});

export {
  getAllUptAdm,
  getUptAdmById,
  createUptAdm,
  updateUptAdm,
  deleteUptAdm,
};
