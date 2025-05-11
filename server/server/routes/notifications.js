// routes/notifications.js
const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications");
const { authenticateUser } = require("../middleware/auth");

// Get all notifications
router.get("/", authenticateUser, notificationsController.getAllNotifications);

// Create a notification (for testing)
router.post("/", authenticateUser, notificationsController.createNotification);

// Mark notification as read
router.put("/:id/read", authenticateUser, notificationsController.markAsRead);

// Delete notification
router.delete(
  "/:id",
  authenticateUser,
  notificationsController.deleteNotification
);

// Mark all notifications as read
router.put(
  "/read-all",
  authenticateUser,
  notificationsController.markAllAsRead
);

module.exports = router;
