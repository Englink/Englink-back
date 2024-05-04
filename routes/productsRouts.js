const express = require('express');
const productsController = require('../controllers/productController');
const authControllers = require('../controllers/authController');

const router = express.Router();
router.route('/')
.get(authControllers.protect, productsController.getProducts)

module.exports = router;