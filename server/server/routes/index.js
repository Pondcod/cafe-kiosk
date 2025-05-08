const express = require('express');
const router = express.Router();

const productRoutes = require('./products');
const categoriesRoutes = require('./categories');
//const ordersRoutes = require('./routes/orders');
//const usersRoutes = require('./routes/users');
//const inventoryRoutes = require('./routes/inventory');

router.use('/products', productRoutes);
router.use('/categories', categoriesRoutes);
//router.use('/orders', ordersRoutes);
//router.use('/users', usersRoutes);
//router.use('/inventory', inventoryRoutes);

module.exports = router;