// routes/customization.js
const express = require('express');
const router = express.Router();
const customizationController = require('../controllers/customization');
// Uncomment when auth middleware is ready
// const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Get customizations by type
router.get(
  '/type/:type', 
  customizationController.getCustomizationsByType
);

// Get customizations for a specific product
router.get(
  '/product/:productId', 
  customizationController.getCustomizationsByProduct
);

// Get all customizations
router.get(
  '/', 
  customizationController.getAllCustomizations
);

// Get customization by ID
router.get(
  '/:id', 
  customizationController.getCustomizationById
);

// Create new customization
router.post(
  '/', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  customizationController.createCustomization
);

// Update customization
router.put(
  '/:id', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  customizationController.updateCustomization
);

// Delete customization
router.delete(
  '/:id', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  customizationController.deleteCustomization
);

// Add customization to product
router.post(
  '/product', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  customizationController.addCustomizationToProduct
);

// Remove customization from product
router.delete(
  '/product/:product_id/customization/:customization_id', 
  // authenticateUser, 
  // authorizeRole(['admin', 'manager']), 
  customizationController.removeCustomizationFromProduct
);

module.exports = router;