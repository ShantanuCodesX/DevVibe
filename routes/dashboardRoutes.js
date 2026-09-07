const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { showDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", authMiddleware, showDashboard);

module.exports = router;