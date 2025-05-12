// routes/auth.js
const express = require("express");
const router = express.Router();

// Import auth middleware functions correctly
// In ./server/routes/auth.js
const { login, register, logout, authenticateUser } = require("../middleware/auth");

// Public routes
router.post("/login", login);
router.post("/register", register);

// Protected routes
router.post("/logout", authenticateUser, logout);

// Create a simple test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
  });
});

module.exports = router;