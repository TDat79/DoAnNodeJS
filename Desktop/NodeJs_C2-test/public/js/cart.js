// Biến toàn cục
let cart = null;

// Hàm load giỏ hàng
async function loadCart() {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            showEmptyCart();
            return;
        }

        const response = await axios.get('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            cart = response.data.data;
            renderCart();
            updateOrderSummary();
        } else {
            showEmptyCart();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showEmptyCart();
    }
}

// Hàm render giỏ hàng
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (!cart || !cart.items || cart.items.length === 0) {
        showEmptyCart();
        return;
    }

    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-product-id="${item.product._id}">
            <img src="${item.product.images[0] || '/images/no-image.jpg'}" 
                 alt="${item.product.productName}" 
                 class="cart-item-image">
            <div class="cart-item-details">
                <h5 class="cart-item-title">${item.product.productName}</h5>
                <div class="cart-item-price">
                    ${item.price.toLocaleString('vi-VN')}đ
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" onclick="updateQuantity('${item.product._id}', ${item.quantity - 1})">-</button>
                    <input type="number" 
                           class="quantity-input" 
                           value="${item.quantity}" 
                           min="1"
                           onchange="updateQuantity('${item.product._id}', this.value)">
                    <button class="quantity-btn increase" onclick="updateQuantity('${item.product._id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.product._id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Enable nút thanh toán
    document.getElementById('checkoutBtn').disabled = false;
}

// Hàm hiển thị giỏ hàng trống
function showEmptyCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <p>Giỏ hàng của bạn đang trống</p>
            <a href="/products" class="btn btn-primary">Tiếp tục mua sắm</a>
        </div>
    `;

    // Disable nút thanh toán
    document.getElementById('checkoutBtn').disabled = true;
}

// Hàm cập nhật số lượng sản phẩm
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để cập nhật giỏ hàng');
            return;
        }

        const response = await axios.put('/api/cart/update', {
            productId,
            quantity: parseInt(newQuantity)
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            cart = response.data.data;
            renderCart();
            updateOrderSummary();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật giỏ hàng');
    }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
async function removeFromCart(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để xóa sản phẩm');
            return;
        }

        const response = await axios.delete(`/api/cart/item/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            cart = response.data.data;
            renderCart();
            updateOrderSummary();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
}

// Hàm cập nhật tổng đơn hàng
function updateOrderSummary() {
    if (!cart || !cart.items || cart.items.length === 0) {
        document.getElementById('subtotal').textContent = '0đ';
        document.getElementById('shipping').textContent = '0đ';
        document.getElementById('total').textContent = '0đ';
        return;
    }

    const subtotal = cart.totalAmount;
    const shipping = 0; // Có thể thêm tính phí vận chuyển sau
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    document.getElementById('shipping').textContent = shipping.toLocaleString('vi-VN') + 'đ';
    document.getElementById('total').textContent = total.toLocaleString('vi-VN') + 'đ';
}

// Hàm xử lý thanh toán
function checkout() {
    // TODO: Implement checkout logic
    alert('Chức năng thanh toán đang được phát triển');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
}); 