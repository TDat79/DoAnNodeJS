// Kiểm tra trạng thái đăng nhập
function checkAuthStatus() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    
    const authButtons = document.getElementById('authButtons');
    const userDropdown = document.getElementById('userDropdown');
    const cartBtn = document.getElementById('cartBtn');
    const usernameSpan = document.getElementById('username');
    
    console.log('Auth Status:', { 
        token, 
        user,
        role: user?.role?.roleName 
    }); // Debug log
    
    if (token && user) {
        // Đã đăng nhập
        if (authButtons) authButtons.style.display = 'none';
        if (userDropdown) {
            userDropdown.style.display = 'block';
            if (usernameSpan) {
                usernameSpan.textContent = user.username || 'Tài khoản';
                console.log('Username set to:', user.username); // Debug log
            }
        }
        if (cartBtn) cartBtn.style.display = 'block';
        
        // Nếu là admin và đang ở trang chủ, chuyển hướng về trang admin
        if (user.role?.roleName === 'ADMIN' && window.location.pathname === '/') {
            window.location.href = '/admin';
        }
    } else {
        // Chưa đăng nhập
        if (authButtons) authButtons.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
    }
}

// Xử lý đăng xuất
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
});

// Load sản phẩm nổi bật
async function loadFeaturedProducts() {
    try {
        const response = await axios.get('/api/products?featured=true');
        const products = response.data.data;
        
        const container = document.getElementById('featuredProducts');
        container.innerHTML = '';
        
        products.forEach(product => {
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${product.images?.[0] || '/images/placeholder.jpg'}" class="card-img-top" alt="${product.productName}">
                        <div class="card-body">
                            <h5 class="card-title">${product.productName}</h5>
                            <p class="card-text">${product.description || ''}</p>
                            <p class="card-text"><strong>${product.price.toLocaleString('vi-VN')}đ</strong></p>
                            <button class="btn btn-primary add-to-cart" data-id="${product._id}">
                                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
        
        // Thêm event listener cho nút thêm vào giỏ
        addCartEventListeners();
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Load danh mục
async function loadCategories() {
    try {
        const response = await axios.get('/api/categories');
        const categories = response.data.data;
        
        const container = document.getElementById('categories');
        container.innerHTML = '';
        
        categories.forEach(category => {
            const card = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title">${category.categoryName}</h5>
                            <p class="card-text">${category.description || ''}</p>
                            <a href="/products?category=${category._id}" class="btn btn-outline-primary">Xem sản phẩm</a>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Thêm event listener cho nút thêm vào giỏ
function addCartEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.closest('button').dataset.id;
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }
                
                await axios.post('/api/cart/add', { productId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Cập nhật số lượng trong giỏ hàng
                updateCartCount();
                
                // Hiển thị thông báo
                alert('Đã thêm sản phẩm vào giỏ hàng');
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
            }
        });
    });
}

// Cập nhật số lượng trong giỏ hàng
async function updateCartCount() {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('/api/cart/count', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const count = response.data.data;
        document.getElementById('cartCount').textContent = count;
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadFeaturedProducts();
    loadCategories();
    updateCartCount();
}); 