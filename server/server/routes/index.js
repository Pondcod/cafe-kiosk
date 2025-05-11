const express = require("express");
const router = express.Router();

const productRoutes = require("./products");
const categoriesRoutes = require("./categories");
const ordersRoutes = require("./orders");
const usersRoutes = require("./users");
const inventoryRoutes = require("./inventory");
const customizationRoutes = require("./customization");
const promotionsRoutes = require("./promotions");
const reportsRoutes = require("./reports");
const authRoutes = require("./auth");
const orderItemsRoutes = require("./orderItems");
const inventoryTransactionsRoutes = require("./inventoryTransactions");
const notificationsRoutes = require("./notifications");

router.use("/products", productRoutes);
router.use("/categories", categoriesRoutes);
router.use("/orders", ordersRoutes);
router.use("/users", usersRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/customization", customizationRoutes);
router.use("/promotions", promotionsRoutes);
router.use("/reports", reportsRoutes);
router.use("/auth", authRoutes);
router.use("/orderItems", orderItemsRoutes);
router.use("/inventoryTransactions", inventoryTransactionsRoutes);
router.use("/notifications", notificationsRoutes);

// Add this to routes/index.js
router.post("/test-upload", (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Files:", req.files);

  res.json({
    success: true,
    receivedBody: req.body,
    receivedFiles: req.files ? true : false,
    fileDetails: req.files?.image
      ? {
          name: req.files.image.name,
          size: req.files.image.size,
          mimetype: req.files.image.mimetype,
        }
      : null,
  });
});
// Add a default route to list available endpoints
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cafe Kiosk API",
    endpoints: [
      "/api/products",
      "/api/categories",
      "/api/orders",
      "/api/users",
      "/api/inventory",
      "/api/customization",
      "/api/promotions",
      "/api/reports",
      "/api/auth",
      "/api/orderItems",
    ],
  });
});

module.exports = router;
