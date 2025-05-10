// routes/auth.js
const express = require("express");
const router = express.Router();
const { login } = require("../middleware/auth"); // Import the login function

// Admin login route
router.post("/login", login);

module.exports = router;