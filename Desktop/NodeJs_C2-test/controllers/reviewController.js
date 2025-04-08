const Review = require('../models/review');
const Product = require('../models/products');

const reviewController = {
    // Lấy tất cả đánh giá của một sản phẩm
    getProductReviews: async (req, res) => {
        try {
            const reviews = await Review.find({ product: req.params.productId })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 });
            res.json({ success: true, reviews });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tạo đánh giá mới
    createReview: async (req, res) => {
        try {
            const { productId, rating, comment, images } = req.body;

            // Kiểm tra sản phẩm tồn tại
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            // Kiểm tra người dùng đã đánh giá sản phẩm này chưa
            const existingReview = await Review.findOne({
                user: req.user._id,
                product: productId
            });

            if (existingReview) {
                return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
            }

            const review = new Review({
                user: req.user._id,
                product: productId,
                rating,
                comment,
                images
            });

            await review.save();
            await review.populate('user', 'name avatar');

            res.status(201).json({ success: true, review });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Cập nhật đánh giá
    updateReview: async (req, res) => {
        try {
            const { rating, comment, images } = req.body;

            const review = await Review.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { rating, comment, images },
                { new: true }
            ).populate('user', 'name avatar');

            if (!review) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
            }

            res.json({ success: true, review });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xóa đánh giá
    deleteReview: async (req, res) => {
        try {
            const review = await Review.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!review) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
            }

            res.json({ success: true, message: 'Đã xóa đánh giá' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = reviewController; 