import express from "express";
import * as ctrl from "../controllers/rkpdController.js";
import {
  validateRkpdCreate,
  validateRkpdUpdate,
} from "../middleware/planningRegulasiValidation.js";

const router = express.Router();

router.get("/meta", async (req, res) => {
  try {
    const { sequelize } = await import("../models/index.js");
    const qi = sequelize.getQueryInterface();
    const description = await qi.describeTable("rkpd");
    const columns = Object.entries(description).map(([name, detail]) => ({
      name,
      type: detail.type,
      allowNull: detail.allowNull,
      defaultValue: detail.defaultValue,
      primaryKey: Boolean(detail.primaryKey),
    }));
    return res.json({
      success: true,
      data: { table: "rkpd", columns },
    });
  } catch (err) {
    console.error("rkpd meta", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal membaca metadata rkpd",
    });
  }
});

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", validateRkpdCreate, ctrl.create);
router.put("/:id", validateRkpdUpdate, ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
