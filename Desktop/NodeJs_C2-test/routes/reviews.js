const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { check_authentication } = require('../Utils/check_auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', check_authentication, reviewController.createReview);
router.put('/:id', check_authentication, reviewController.updateReview);
router.delete('/:id', check_authentication, reviewController.deleteReview);

module.exports = router; 