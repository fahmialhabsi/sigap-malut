const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Using controller router directly (taskController is an express.Router)
router.use("/", taskController);

module.exports = router;
