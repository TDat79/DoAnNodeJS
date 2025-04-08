const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

router.get('/', check_authentication, orderController.getAllOrders);
router.get('/:id', check_authentication, orderController.getOrderById);
router.post('/', check_authentication, orderController.createOrder);
router.put('/:id/status', 
    check_authentication, 
    check_authorization(['admin']), 
    orderController.updateOrderStatus
);
router.put('/:id/cancel', check_authentication, orderController.cancelOrder);

module.exports = router; 