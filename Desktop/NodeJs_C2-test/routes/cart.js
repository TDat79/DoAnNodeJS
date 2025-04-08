const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { check_authentication } = require('../Utils/check_auth');

router.get('/', check_authentication, cartController.getCart);
router.post('/add', check_authentication, cartController.addToCart);
router.put('/update', check_authentication, cartController.updateCartItem);
router.delete('/item/:productId', check_authentication, cartController.removeFromCart);
router.delete('/clear', check_authentication, cartController.clearCart);

module.exports = router; 