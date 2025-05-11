// routes/reports.js
const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
const { authenticateUser, authorizeRole } = require("../middleware/auth");

// Protected reports routes - only for admin and managers
router.get(
  "/sales/summary",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  reportsController.getSalesSummary
);

router.get(
  "/products/top",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  reportsController.getTopProducts
);

router.get(
  "/inventory/status",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  reportsController.getInventoryStatus
);

module.exports = router;
