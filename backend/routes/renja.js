import express from "express";
import * as ctrl from "../controllers/renjaController.js";
import {
  validateRenjaCreate,
  validateRenjaUpdate,
} from "../middleware/planningRegulasiValidation.js";

const router = express.Router();

router.get("/meta", ctrl.getMeta);
router.get("/", ctrl.list);
router.post("/link-rkpd", ctrl.postLinkRkpd);
router.get("/:id/rkpd", ctrl.listRkpdByRenjaId);
router.get("/:id", ctrl.getById);
router.post("/", validateRenjaCreate, ctrl.create);
router.put("/:id", validateRenjaUpdate, ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
