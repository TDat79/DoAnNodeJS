// Biến toàn cục
let currentPage = 1;
let currentCategory = 'all';
let currentSort = 'newest';
let minPrice = null;
let maxPrice = null;

// Hàm load header
async function loadHeader() {
    try {
        const response = await fetch('/pages/partials/header.html');
        const headerHtml = await response.text();
        document.getElementById('header').innerHTML = headerHtml;
        
        // Khởi tạo trạng thái đăng nhập
        initializeAuthState();
        
        // Thêm event listener cho nút đăng xuất
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Hàm xử lý đăng xuất
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/';
}

// Hàm khởi tạo trạng thái đăng nhập
function initializeAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    try {
        if (token && userStr) {
            const user = JSON.parse(userStr);
            console.log('Current user:', user); // Debug log
            
            // Cập nhật UI
            const authButtons = document.getElementById('authButtons');
            const userDropdown = document.getElementById('userDropdown');
            const cartBtn = document.getElementById('cartBtn');
            const usernameSpan = document.getElementById('username');
            
            if (authButtons) authButtons.style.display = 'none';
            if (userDropdown) {
                userDropdown.style.display = 'block';
                if (usernameSpan && user.username) {
                    usernameSpan.textContent = user.username;
                }
            }
            if (cartBtn) cartBtn.style.display = 'block';
            
            // Cập nhật số lượng giỏ hàng
            updateCartCount();
        }
    } catch (error) {
        console.error('Error initializing auth state:', error);
    }
}

// Hàm cập nhật số lượng giỏ hàng
function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('/api/cart/count', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.data.success) {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = response.data.data;
            }
        }
    })
    .catch(error => {
        console.error('Error updating cart count:', error);
    });
}

// Hàm load footer
async function loadFooter() {
    try {
        const response = await fetch('/pages/partials/footer.html');
        const footerHtml = await response.text();
        document.getElementById('footer').innerHTML = footerHtml;
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Hàm load danh mục sản phẩm
function loadCategories() {
    console.log('Loading categories...'); // Debug log
    
    axios.get('/api/categories')
        .then(response => {
            console.log('Categories API Response:', response.data); // Debug log
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải danh mục');
            }

            const categories = response.data.data;
            const categoryList = document.querySelector('.category-list');
            categoryList.innerHTML = '';

            // Thêm nút "Tất cả"
            const allItem = document.createElement('li');
            allItem.innerHTML = `
                <a href="#" class="category-link active" data-category-id="all">
                    <i class="fas fa-th-large"></i> Tất cả
                </a>
            `;
            categoryList.appendChild(allItem);

            // Thêm các danh mục
            categories.forEach(category => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <a href="#" class="category-link" data-category-id="${category._id}">
                        <i class="fas fa-folder"></i> ${category.categoryName}
                    </a>
                `;
                categoryList.appendChild(item);
            });

            // Thêm event listener cho các danh mục
            document.querySelectorAll('.category-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    currentCategory = link.dataset.categoryId;
                    currentPage = 1;
                    loadProducts();
                });
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            showError(error.message || 'Không thể tải danh mục sản phẩm');
        });
}

// Hàm load sản phẩm
function loadProducts() {
    let url = `/api/products?page=${currentPage}`;
    
    if (currentCategory !== 'all') {
        url += `&category=${currentCategory}`;
    }
    
    if (minPrice !== null) {
        url += `&minPrice=${minPrice}`;
    }
    
    if (maxPrice !== null) {
        url += `&maxPrice=${maxPrice}`;
    }

    // Thêm sort nếu có
    if (currentSort !== 'newest') {
        url += `&sort=${currentSort}`;
    }

    console.log('Fetching products from:', url); // Debug log

    axios.get(url)
        .then(response => {
            console.log('API Response:', response.data); // Debug log
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải sản phẩm');
            }

            const { products, totalPages } = response.data.data;
            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = '';

            if (!products || products.length === 0) {
                productsGrid.innerHTML = '<div class="col-12 text-center"><p>Không tìm thấy sản phẩm nào</p></div>';
                return;
            }

            products.forEach(product => {
                const col = document.createElement('div');
                col.className = 'col-md-4 col-sm-6';
                col.innerHTML = `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
                            <button class="btn btn-primary w-100 add-to-cart" data-product-id="${product._id}">
                                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                `;
                productsGrid.appendChild(col);
            });

            // Cập nhật phân trang
            updatePagination(totalPages);

            // Thêm event listener cho nút thêm vào giỏ
            addCartEventListeners();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showError(error.message || 'Không thể tải danh sách sản phẩm');
        });
}

// Hàm cập nhật phân trang
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Nút Previous
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);

    // Các nút trang
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${currentPage === i ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pagination.appendChild(li);
    }

    // Nút Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);

    // Thêm event listener cho các nút phân trang
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const text = e.target.textContent.trim();
            if (text === '«') {
                if (currentPage > 1) {
                    currentPage--;
                    loadProducts();
                }
            } else if (text === '»') {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadProducts();
                }
            } else {
                currentPage = parseInt(text);
                loadProducts();
            }
        });
    });
}

// Hàm thêm event listener cho nút thêm vào giỏ
function addCartEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.add-to-cart').dataset.productId;
            addToCart(productId);
        });
    });
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập không?')) {
            window.location.href = '/login';
        }
        return;
    }

    axios.post('/api/cart/add', { productId }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.data.success) {
            throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
        }

        showSuccess('Đã thêm sản phẩm vào giỏ hàng');
        // Gọi hàm updateCartCount từ common.js
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        showError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    });
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
    alert(message);
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    alert(message);
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    // Load danh mục và sản phẩm
    loadCategories();
    loadProducts();

    // Thêm event listener cho select sắp xếp
    document.getElementById('sortBy').addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        loadProducts();
    });

    // Thêm event listener cho nút áp dụng bộ lọc
    document.getElementById('applyFilter').addEventListener('click', () => {
        minPrice = document.getElementById('minPrice').value || null;
        maxPrice = document.getElementById('maxPrice').value || null;
        currentPage = 1;
        loadProducts();
    });
}); 