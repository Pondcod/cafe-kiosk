// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const { authenticateUser } = require("../middleware/auth");

// Dashboard summary - authenticated users only
router.get(
  "/summary",
  authenticateUser,
  dashboardController.getDashboardSummary
);

module.exports = router;
