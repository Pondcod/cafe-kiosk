// routes/orderItems.js
const express = require("express");
const router = express.Router();
const orderItemsController = require("../controllers/orderItems");
const { authenticateUser } = require("../middleware/auth");

// Get all items for a specific order
router.get(
  "/:orderId/items",
  authenticateUser,
  orderItemsController.getOrderItems
);

// Add item to an order
router.post(
  "/:orderId/items",
  authenticateUser,
  orderItemsController.addOrderItem
);

module.exports = router;
