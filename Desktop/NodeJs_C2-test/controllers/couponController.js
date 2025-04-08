const Coupon = require('../models/coupon');

const couponController = {
    // Lấy tất cả mã giảm giá
    getAllCoupons: async (req, res) => {
        try {
            const coupons = await Coupon.find().sort({ createdAt: -1 });
            res.json({ success: true, coupons });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tạo mã giảm giá mới
    createCoupon: async (req, res) => {
        try {
            const {
                code,
                type,
                value,
                minPurchase,
                maxDiscount,
                startDate,
                endDate,
                usageLimit
            } = req.body;

            const coupon = new Coupon({
                code,
                type,
                value,
                minPurchase,
                maxDiscount,
                startDate,
                endDate,
                usageLimit
            });

            await coupon.save();
            res.status(201).json({ success: true, coupon });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Kiểm tra mã giảm giá
    validateCoupon: async (req, res) => {
        try {
            const { code, totalAmount } = req.body;

            const coupon = await Coupon.findOne({
                code: code.toUpperCase(),
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() },
                isActive: true,
                usedCount: { $lt: "$usageLimit" }
            });

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }

            if (totalAmount < coupon.minPurchase) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Đơn hàng tối thiểu ${coupon.minPurchase}đ để sử dụng mã này`
                });
            }

            let discountAmount;
            if (coupon.type === 'percentage') {
                discountAmount = (totalAmount * coupon.value) / 100;
                if (coupon.maxDiscount) {
                    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
            } else {
                discountAmount = coupon.value;
            }

            res.json({ 
                success: true, 
                coupon,
                discountAmount
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Cập nhật mã giảm giá
    updateCoupon: async (req, res) => {
        try {
            const coupon = await Coupon.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
            }

            res.json({ success: true, coupon });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xóa mã giảm giá
    deleteCoupon: async (req, res) => {
        try {
            const coupon = await Coupon.findByIdAndDelete(req.params.id);

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
            }

            res.json({ success: true, message: 'Đã xóa mã giảm giá' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = couponController; 