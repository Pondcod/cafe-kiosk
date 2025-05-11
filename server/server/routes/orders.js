// routes/orders.js
const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const { authenticateUser, authorizeRole } = require("../middleware/auth");

// Route to get orders by date range
router.get(
  "/date-range",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  ordersController.getOrdersByDateRange
);

// Route to get all orders
router.get(
  "/",
  authenticateUser,
  authorizeRole(["admin", "manager", "staff"]),
  ordersController.getAllOrders
);

// Route to get a specific order
router.get("/:id", authenticateUser, ordersController.getOrderById);

// Route to create a new order
router.post(
  "/",
  // For kiosk orders, authentication might not be required
  ordersController.createOrder
);

// Route to update order status
router.put(
  "/:id/status",
  authenticateUser,
  authorizeRole(["admin", "manager", "staff"]),
  ordersController.updateOrderStatus
);

// Route to process payment
router.post(
  "/:id/payment",
  // For kiosk payments, authentication might not be required
  ordersController.processPayment
);

// NEW: Route to apply promotions to an order
router.post(
  "/:id/apply-promotions",
  // For kiosk usage, authentication might not be required
  ordersController.applyPromotionsToOrder
);

module.exports = router;
