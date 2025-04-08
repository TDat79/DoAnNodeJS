const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { check_authentication, check_authorization } = require('../Utils/check_auth');

router.get('/', check_authentication, couponController.getAllCoupons);
router.post('/', 
    check_authentication, 
    check_authorization(['admin']), 
    couponController.createCoupon
);
router.post('/validate', check_authentication, couponController.validateCoupon);
router.put('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    couponController.updateCoupon
);
router.delete('/:id', 
    check_authentication, 
    check_authorization(['admin']), 
    couponController.deleteCoupon
);

module.exports = router; 