const Cart = require('../models/cart');
const Product = require('../models/products');

const cartController = {
    // Lấy giỏ hàng của user
    getCart: async (req, res) => {
        try {
            let cart = await Cart.findOne({ user: req.user._id })
                .populate('items.product', 'productName price images isDeleted status');
            
            if (!cart) {
                cart = await Cart.create({ 
                    user: req.user._id, 
                    items: [],
                    totalAmount: 0
                });
            } else {
                // Lọc bỏ các sản phẩm đã bị xóa hoặc không còn active
                cart.items = cart.items.filter(item => 
                    item.product && 
                    !item.product.isDeleted && 
                    item.product.status === 'active'
                );

                // Tính lại tổng tiền
                cart.totalAmount = cart.items.reduce((total, item) => 
                    total + (item.price * item.quantity), 0
                );

                await cart.save();
            }

            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (req, res) => {
        try {
            const { productId, quantity = 1 } = req.body;
            
            // Kiểm tra user đã đăng nhập chưa
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng'
                });
            }

            const userId = req.user._id;

            // Kiểm tra sản phẩm tồn tại và đang active
            const product = await Product.findOne({ 
                _id: productId, 
                isDeleted: false,
                status: 'active'
            });
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại hoặc không khả dụng'
                });
            }

            // Tìm giỏ hàng của user
            let cart = await Cart.findOne({ user: userId });
            
            if (!cart) {
                // Nếu chưa có giỏ hàng, tạo mới
                cart = new Cart({
                    user: userId,
                    items: [{
                        product: productId,
                        quantity,
                        price: product.price // Thêm giá sản phẩm
                    }],
                    totalAmount: product.price * quantity
                });
            } else {
                // Nếu đã có giỏ hàng, kiểm tra sản phẩm đã tồn tại chưa
                const existingItem = cart.items.find(item => item.product.toString() === productId);
                
                if (existingItem) {
                    // Nếu đã tồn tại, cập nhật số lượng và giá
                    existingItem.quantity += quantity;
                    existingItem.price = product.price; // Cập nhật giá mới nhất
                } else {
                    // Nếu chưa tồn tại, thêm mới
                    cart.items.push({
                        product: productId,
                        quantity,
                        price: product.price
                    });
                }

                // Tính lại tổng tiền
                cart.totalAmount = cart.items.reduce((total, item) => 
                    total + (item.price * item.quantity), 0
                );
            }

            await cart.save();
            
            // Populate thông tin sản phẩm trước khi trả về
            await cart.populate('items.product', 'productName price images');
            
            res.status(200).json({
                success: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                data: cart
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng'
            });
        }
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartItem: async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            // Kiểm tra sản phẩm tồn tại và không bị xóa
            const product = await Product.findOne({ 
                _id: productId,
                isDeleted: false,
                status: 'active'
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại hoặc không khả dụng'
                });
            }

            // Kiểm tra số lượng trong kho
            if (product.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng sản phẩm trong kho không đủ'
                });
            }

            const cart = await Cart.findOne({ user: req.user._id });
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giỏ hàng'
                });
            }

            const cartItem = cart.items.find(item => 
                item.product.toString() === productId
            );

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                });
            }

            cartItem.quantity = quantity;
            cartItem.price = product.price; // Cập nhật giá mới nhất

            // Tính lại tổng tiền
            cart.totalAmount = cart.items.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );

            await cart.save();
            await cart.populate('items.product', 'productName price images');

            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (req, res) => {
        try {
            const { productId } = req.params;

            const cart = await Cart.findOne({ user: req.user._id });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
            }

            cart.items = cart.items.filter(item => 
                item.product.toString() !== productId
            );

            cart.totalAmount = cart.items.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );

            await cart.save();
            await cart.populate('items.product', 'name price image');

            res.json({ success: true, cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user: req.user._id });
            if (cart) {
                cart.items = [];
                cart.totalAmount = 0;
                await cart.save();
            }

            res.json({ success: true, message: 'Đã xóa giỏ hàng' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = cartController; 