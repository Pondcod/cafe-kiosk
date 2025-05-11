// routes/auth.js
const express = require("express");
const router = express.Router();
const { login } = require("../middleware/auth");

// Login route
router.post("/login", login);

// Create a simple test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
  });
});

module.exports = router;
