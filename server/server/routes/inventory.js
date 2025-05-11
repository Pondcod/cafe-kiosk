// routes/inventory.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory");
// Uncomment when auth middleware is ready
// const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Get low stock inventory items
router.get(
  "/low-stock",
  // authenticateUser,
  // authorizeRole(['admin', 'manager', 'staff']),
  inventoryController.getLowStockInventory
);

// Get all inventory items
router.get(
  "/",
  // authenticateUser,
  // authorizeRole(['admin', 'manager', 'staff']),
  inventoryController.getAllInventory
);

// Get inventory item by ID
router.get(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager', 'staff']),
  inventoryController.getInventoryById
);

// Create new inventory item
router.post(
  "/",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  inventoryController.createInventory
);

// Update inventory item
router.put(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager', 'staff']),
  inventoryController.updateInventory
);

// Delete inventory item
router.delete(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  inventoryController.deleteInventory
);

// Restock inventory
router.post(
  "/:id/restock",
  // authenticateUser,
  // authorizeRole(['admin', 'manager', 'staff']),
  inventoryController.restockInventory
);

module.exports = router;
