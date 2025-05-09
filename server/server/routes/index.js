const express = require('express');
const router = express.Router();

const productRoutes = require('./products');
const categoriesRoutes = require('./categories');
const ordersRoutes = require('./orders');
const usersRoutes = require('./users');
const inventoryRoutes = require('./inventory');
const customizationRoutes = require('./customization');

router.use('/products', productRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customization', customizationRoutes);

// Add a default route to list available endpoints
router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Cafe Kiosk API',
      endpoints: [
        '/api/products',
        '/api/categories',
        '/api/orders',
        '/api/users',
        '/api/inventory',
        '/api/customization'
      ]
    });
  });

module.exports = router;