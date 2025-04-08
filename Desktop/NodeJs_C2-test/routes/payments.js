const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

router.get('/', 
    check_authentication, 
    check_authorization(['admin']), 
    paymentController.getAllPayments
);
router.post('/', check_authentication, paymentController.createPayment);
router.put('/:id/status', 
    check_authentication, 
    check_authorization(['admin']), 
    paymentController.updatePaymentStatus
);
router.post('/:id/refund', 
    check_authentication, 
    check_authorization(['admin']), 
    paymentController.refundPayment
);

module.exports = router; 