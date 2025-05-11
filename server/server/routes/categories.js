// server/routes/categories.js
const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories");
// Uncomment the next line if you want to keep authentication
// const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategoryById);

// OPTION 1: Remove authentication for development - use this to match products
router.post("/", categoriesController.createCategory);
router.put("/:id", categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

// OPTION 2: Keep authentication - Uncomment these and comment out the lines above
// router.post("/", isAuthenticated, isAdmin, categoriesController.createCategory);
// router.put("/:id", isAuthenticated, isAdmin, categoriesController.updateCategory);
// router.delete("/:id", isAuthenticated, isAdmin, categoriesController.deleteCategory);

module.exports = router;
