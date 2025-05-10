// routes/promotions.js
const express = require("express");
const router = express.Router();
const promotionsController = require("../controllers/promotions");
// Uncomment when auth middleware is ready
// const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Get active promotions for today
router.get("/active", promotionsController.getActivePromotions);

// Apply promotions to a cart
router.post("/apply", promotionsController.applyPromotionsToCart);

// Get all promotions
router.get(
  "/",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  promotionsController.getAllPromotions
);

// Get promotion by ID
router.get(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  promotionsController.getPromotionById
);

// Create new promotion
router.post(
  "/",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  promotionsController.createPromotion
);

// Update promotion
router.put(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  promotionsController.updatePromotion
);

// Delete promotion
router.delete(
  "/:id",
  // authenticateUser,
  // authorizeRole(['admin', 'manager']),
  promotionsController.deletePromotion
);

module.exports = router;
