// Load header and footer
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, fetching header...');
    // Load header
    fetch('/pages/partials/header.html')
        .then(response => {
            console.log('Header response:', response);
            return response.text();
        })
        .then(data => {
            console.log('Header data received:', data);
            document.getElementById('header').innerHTML = data;
            console.log('Header element after update:', document.getElementById('header'));
            // Initialize header functionality
            initializeHeader();
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('/pages/partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Load featured products
    loadFeaturedProducts();
});

// Initialize header functionality
function initializeHeader() {
    console.log('Initializing header...');
    // Check authentication status
    checkAuthStatus();

    // Add event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Logout button:', logoutBtn);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Check authentication status
function checkAuthStatus() {
    console.log('Checking auth status...');
    // Kiểm tra cả localStorage và sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    console.log('Token:', token);
    console.log('User:', user);
    
    const authButtons = document.getElementById('authButtons');
    const userDropdown = document.getElementById('userDropdown');
    const cartBtn = document.getElementById('cartBtn');
    const usernameSpan = document.getElementById('username');

    console.log('Auth elements:', {
        authButtons,
        userDropdown,
        cartBtn,
        usernameSpan
    });

    if (token) {
        console.log('User is logged in');
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        if (cartBtn) cartBtn.style.display = 'block';

        // Hiển thị username từ user object đã lưu
        if (usernameSpan) {
            usernameSpan.textContent = user.username || user.name || user.email;
        }

        // Get cart count
        fetch('/api/cart/count', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Cart count response:', data);
            if (data.success) {
                const cartCount = document.getElementById('cartCount');
                if (cartCount) cartCount.textContent = data.data;
            }
        })
        .catch(error => console.error('Error fetching cart count:', error));
    } else {
        console.log('User is not logged in');
        // User is not logged in
        if (authButtons) authButtons.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    // Xóa token từ cả localStorage và sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
}

// Load featured products
function loadFeaturedProducts() {
    fetch('/api/products/featured')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productsContainer = document.getElementById('featuredProducts');
                if (productsContainer) {
                    productsContainer.innerHTML = '';
                    data.data.forEach(product => {
                        const productCard = createProductCard(product);
                        productsContainer.appendChild(productCard);
                    });
                }
            }
        })
        .catch(error => console.error('Error loading featured products:', error));
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';

    col.innerHTML = `
        <div class="card h-100">
            <img src="${product.image || '/images/no-image.jpg'}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"><strong>${product.price.toLocaleString('vi-VN')}đ</strong></p>
                <a href="/products/${product._id}" class="btn btn-primary">Xem chi tiết</a>
            </div>
        </div>
    `;

    return col;
} 