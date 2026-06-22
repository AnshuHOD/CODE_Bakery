const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');

router.get('/', getAllProducts);           // Public — menu dikhana
router.get('/:id', getProductById);       // Public — single item
router.post('/', protect, createProduct); // Admin only
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
