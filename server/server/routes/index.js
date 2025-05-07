// server/routes/index.js
const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categories');

router.use('/categories', categoryRoutes);

module.exports = router;