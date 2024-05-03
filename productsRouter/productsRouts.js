const express = require('express');
const productsController = require('../controllers/productController');

const router = express.Router();
router.route('/')
.get(productsController.getProducts)

module.exports = router;