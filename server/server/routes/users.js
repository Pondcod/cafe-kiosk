// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { authenticateUser, authorizeRole } = require("../middleware/auth");

// Public route for creating new user (registration)
router.post("/register", usersController.createUser);

// Protected routes
router.get(
  "/",
  authenticateUser, // Now we're applying auth middleware
  authorizeRole(["admin", "manager"]),
  usersController.getAllUsers
);

router.get("/:id", authenticateUser, usersController.getUserById);

router.put("/:id", authenticateUser, usersController.updateUser);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole(["admin"]),
  usersController.deleteUser
);

module.exports = router;
