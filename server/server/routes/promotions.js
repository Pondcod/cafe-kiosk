// routes/promotions.js
const express = require("express");
const router = express.Router();
const promotionsController = require("../controllers/promotions");
const { authenticateUser, authorizeRole } = require("../middleware/auth");

// Get active promotions (public endpoint - no auth required)
router.get("/active", promotionsController.getActivePromotions);

// Get all promotions
router.get(
  "/",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.getAllPromotions
);

// Get promotion by ID
router.get(
  "/:id",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.getPromotionById
);

// Create new promotion
router.post(
  "/",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.createPromotion
);

// Update promotion
router.put(
  "/:id",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.updatePromotion
);

// Delete promotion
router.delete(
  "/:id",
  authenticateUser,
  authorizeRole(["admin"]),
  promotionsController.deletePromotion
);

// Add product to promotion
router.post(
  "/product",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.addProductToPromotion
);

// Remove product from promotion
router.delete(
  "/:promotion_id/product/:product_id",
  authenticateUser,
  authorizeRole(["admin", "manager"]),
  promotionsController.removeProductFromPromotion
);

module.exports = router;
