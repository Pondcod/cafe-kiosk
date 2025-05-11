// routes/inventoryTransactions.js
const express = require("express");
const router = express.Router();
const inventoryTransactionsController = require("../controllers/inventoryTransactions");
const { authenticateUser, authorizeRole } = require("../middleware/auth");

// Get all transactions
router.get(
  "/",
  authenticateUser,
  inventoryTransactionsController.getAllTransactions
);

// Get transaction by ID
router.get(
  "/:id",
  authenticateUser,
  inventoryTransactionsController.getTransactionById
);

// Create new transaction
router.post(
  "/",
  authenticateUser,
  authorizeRole(["admin", "manager"]), // Restrict who can create transactions
  inventoryTransactionsController.createTransaction
);

module.exports = router;
