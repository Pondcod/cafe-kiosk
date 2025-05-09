// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
// Uncomment when auth middleware is ready
// const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Public route for login
router.post('/login', usersController.login);

// Public route for creating new user (registration)
router.post('/register', usersController.createUser);

// Protected routes - accessible only to authenticated users with right permissions
// For now, we're not applying authentication middleware
router.get(
  '/', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  usersController.getAllUsers
);

router.get(
  '/:id', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  usersController.getUserById
);

router.put(
  '/:id', 
  // authenticateUser, 
  // Check if user is updating their own profile or is admin
  // Custom middleware would be needed here
  usersController.updateUser
);

router.delete(
  '/:id', 
  // authenticateUser, 
  // authorizeRole(['admin']), 
  usersController.deleteUser
);

module.exports = router;