const Payment = require('../models/payment');
const Order = require('../models/order');

const paymentController = {
    // Lấy tất cả thanh toán
    getAllPayments: async (req, res) => {
        try {
            const payments = await Payment.find()
                .populate('order')
                .sort({ createdAt: -1 });
            res.json({ success: true, payments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tạo thanh toán mới
    createPayment: async (req, res) => {
        try {
            const { orderId, amount, paymentMethod, paymentDetails } = req.body;

            // Kiểm tra đơn hàng tồn tại
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }

            const payment = new Payment({
                order: orderId,
                amount,
                paymentMethod,
                paymentDetails,
                transactionId: 'TXN' + Date.now()
            });

            await payment.save();

            // Cập nhật trạng thái thanh toán của đơn hàng
            order.paymentStatus = 'paid';
            await order.save();

            res.status(201).json({ success: true, payment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Cập nhật trạng thái thanh toán
    updatePaymentStatus: async (req, res) => {
        try {
            const { status } = req.body;

            const payment = await Payment.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            ).populate('order');

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
            }

            // Cập nhật trạng thái thanh toán của đơn hàng
            if (status === 'completed') {
                await Order.findByIdAndUpdate(payment.order, {
                    paymentStatus: 'paid'
                });
            } else if (status === 'failed') {
                await Order.findByIdAndUpdate(payment.order, {
                    paymentStatus: 'failed'
                });
            }

            res.json({ success: true, payment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Hoàn tiền
    refundPayment: async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id);
            if (!payment) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
            }

            payment.status = 'refunded';
            await payment.save();

            // Cập nhật trạng thái đơn hàng
            await Order.findByIdAndUpdate(payment.order, {
                status: 'cancelled',
                paymentStatus: 'refunded'
            });

            res.json({ success: true, payment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = paymentController; 