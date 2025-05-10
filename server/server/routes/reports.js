// routes/reports.js
const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
// Uncomment when auth middleware is ready
// const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Dashboard summary for quick overview
router.get(
  "/dashboard",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  reportsController.getDashboardSummary
);

// Sales summary report
router.get(
  "/sales",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  reportsController.getSalesSummary
);

// Inventory usage report
router.get(
  "/inventory",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  reportsController.getInventoryUsageReport
);

// Product popularity analytics
router.get(
  "/product-popularity",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  reportsController.getProductPopularity
);

module.exports = router;
