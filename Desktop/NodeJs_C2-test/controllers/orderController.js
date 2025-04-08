const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');

const orderController = {
    // Lấy tất cả đơn hàng
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 });
            res.json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy chi tiết một đơn hàng
    getOrderById: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id)
                .populate('user', 'name email');
            const orderDetails = await OrderDetail.find({ order: req.params.id })
                .populate('product', 'name price');
            
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }
            
            res.json({ success: true, order, orderDetails });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tạo đơn hàng mới
    createOrder: async (req, res) => {
        try {
            const { 
                totalAmount, 
                shippingAddress, 
                phoneNumber,
                items // array of {product, quantity, price}
            } = req.body;

            // Tạo mã đơn hàng
            const orderNumber = 'ORD' + Date.now();

            const order = new Order({
                user: req.user._id, // Giả sử có middleware auth
                orderNumber,
                totalAmount,
                shippingAddress,
                phoneNumber
            });

            await order.save();

            // Tạo chi tiết đơn hàng
            const orderDetails = items.map(item => ({
                order: order._id,
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));

            await OrderDetail.insertMany(orderDetails);

            res.status(201).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }

            res.json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Hủy đơn hàng
    cancelOrder: async (req, res) => {
        try {
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status: 'cancelled' },
                { new: true }
            );
            
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }

            res.json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = orderController; 