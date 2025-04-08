// Xử lý chuyển đổi giữa các section
document.addEventListener('DOMContentLoaded', () => {
    // Lấy tất cả các nav-link trong sidebar
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    // Xử lý sự kiện click cho mỗi nav-link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Lấy section tương ứng
            const sectionId = link.getAttribute('data-section');
            if (!sectionId) return;
            
            // Ẩn tất cả các section
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Hiển thị section được chọn
            const selectedSection = document.getElementById(`${sectionId}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }
            
            // Cập nhật trạng thái active cho nav-link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            link.classList.add('active');
            
            // Load dữ liệu cho section được chọn
            loadSectionData(sectionId);
        });
    });
    
    // Load dữ liệu ban đầu cho section products
    loadSectionData('products');
});

// Hàm load dữ liệu cho từng section
async function loadSectionData(sectionId) {
    try {
        switch (sectionId) {
            case 'products':
                await loadProducts();
                break;
            case 'categories':
                await loadCategories();
                break;
            case 'orders':
                await loadOrders();
                break;
            case 'users':
                await loadUsers();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${sectionId}:`, error);
    }
}

// Hàm load danh sách sản phẩm
async function loadProducts() {
    try {
        const response = await axios.get('/api/products');
        console.log('API Response:', response.data);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Không thể tải danh sách sản phẩm');
        }

        const products = response.data.data.products || [];
        console.log('Products:', products);
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        
        if (products.length > 0) {
            products.forEach(product => {
                console.log('Processing product:', product);
                
                // Lấy tên danh mục từ product.categoryID
                const categoryName = product.categoryID ? product.categoryID.categoryName : 'Chưa phân loại';
                
                // Kiểm tra trạng thái sản phẩm
                const status = product.status || 'active'; // Mặc định là active nếu không có trạng thái
                
                const row = `
                    <tr>
                        <td>${product._id}</td>
                        <td>
                            ${product.image 
                                ? `<img src="${product.image}" alt="${product.name}" class="image-preview">` 
                                : 'Chưa có ảnh'}
                        </td>
                        <td>${product.name || 'Chưa có tên'}</td>
                        <td>${product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Chưa có giá'}</td>
                        <td>${categoryName}</td>
                        <td>
                            <span class="badge ${status === 'active' ? 'badge-success' : 'badge-danger'}">
                                ${status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-product" data-id="${product._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-product" data-id="${product._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
            
            // Thêm event listener cho các nút edit và delete sau khi load xong
            addProductEventListeners();
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có sản phẩm nào</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải danh sách sản phẩm</td></tr>';
    }
}

// Hàm load danh sách danh mục
async function loadCategories() {
    try {
        const response = await axios.get('/api/categories');
        const categories = response.data.data;
        
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const row = `
                <tr>
                    <td>${category.categoryName}</td>
                    <td>${category.description || 'Không có mô tả'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Thêm event listener cho các nút sau khi load xong
        addCategoryEventListeners();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Hàm load danh sách đơn hàng
async function loadOrders() {
    try {
        const response = await axios.get('/api/orders');
        const orders = response.data.data;
        
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = `
                <tr>
                    <td>${order._id}</td>
                    <td>${order.user?.username || 'Khách hàng'}</td>
                    <td>${order.totalAmount.toLocaleString('vi-VN')}đ</td>
                    <td>
                        <span class="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">
                            ${order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                    </td>
                    <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order" data-id="${order._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success update-order" data-id="${order._id}">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Hàm load danh sách người dùng
async function loadUsers() {
    try {
        const response = await axios.get('/api/users');
        const users = response.data.data;
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user._id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role?.roleName || 'Người dùng'}</td>
                    <td>
                        <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">
                            ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user" data-id="${user._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Hàm load danh mục cho select box
async function loadCategoriesForSelect() {
    try {
        const response = await axios.get('/api/categories');
        const categories = response.data.data;
        const select = document.getElementById('productCategory');
        if (!select) return;
        
        select.innerHTML = '<option value="">Chọn danh mục</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.categoryName || category.name || 'Không có tên';
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories for select:', error);
    }
}

// Hàm thêm event listener cho các nút sản phẩm
function addProductEventListeners() {
    // Nút thêm sản phẩm
    document.getElementById('addProductBtn')?.addEventListener('click', async () => {
        document.getElementById('productId').value = '';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        await loadCategoriesForSelect();
        new bootstrap.Modal(document.getElementById('productModal')).show();
    });
    
    // Nút sửa sản phẩm
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.closest('button').dataset.id;
            try {
                const response = await axios.get(`/api/products/${productId}`);
                const product = response.data.data;
                
                document.getElementById('productId').value = product._id;
                document.getElementById('productName').value = product.productName;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productStatus').value = product.status;
                
                // Load danh mục và chọn danh mục hiện tại
                await loadCategoriesForSelect();
                if (product.categoryID) {
                    document.getElementById('productCategory').value = product.categoryID._id;
                }
                
                // Hiển thị ảnh preview
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.innerHTML = '';
                if (product.images && product.images.length > 0) {
                    product.images.forEach(image => {
                        const img = document.createElement('img');
                        img.src = image;
                        img.className = 'img-thumbnail m-1';
                        img.style.maxHeight = '100px';
                        imagePreview.appendChild(img);
                    });
                }
                
                new bootstrap.Modal(document.getElementById('productModal')).show();
            } catch (error) {
                console.error('Error loading product:', error);
                alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải thông tin sản phẩm');
            }
        });
    });
    
    // Nút xóa sản phẩm
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.closest('button').dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    if (!token) {
                        throw new Error('Bạn chưa đăng nhập');
                    }

                    const response = await axios.delete(`/api/products/${productId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        alert('Xóa sản phẩm thành công');
                        loadProducts(); // Load lại danh sách sản phẩm
                    } else {
                        throw new Error(response.data.message || 'Có lỗi xảy ra khi xóa sản phẩm');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
                }
            }
        });
    });
    
    // Xử lý preview ảnh khi chọn file
    const productImagesInput = document.getElementById('productImages');
    if (productImagesInput) {
        // Xóa tất cả event listener cũ
        const newProductImagesInput = productImagesInput.cloneNode(true);
        productImagesInput.parentNode.replaceChild(newProductImagesInput, productImagesInput);
        
        // Thêm event listener mới
        newProductImagesInput.addEventListener('change', function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = ''; // Xóa tất cả ảnh preview cũ
            
            if (this.files && this.files.length > 0) {
                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'img-thumbnail m-1';
                        img.style.maxHeight = '100px';
                        preview.appendChild(img);
                    }
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    // Nút lưu sản phẩm
    const saveProductBtn = document.getElementById('saveProductBtn');
    if (saveProductBtn) {
        // Xóa tất cả event listener cũ
        const newSaveProductBtn = saveProductBtn.cloneNode(true);
        saveProductBtn.parentNode.replaceChild(newSaveProductBtn, saveProductBtn);
        
        // Thêm event listener mới
        newSaveProductBtn.addEventListener('click', async () => {
            const productId = document.getElementById('productId').value;
            
            // Lấy giá trị từ form
            const productName = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const categoryID = document.getElementById('productCategory').value;
            const status = document.getElementById('productStatus').value;
            const description = document.getElementById('productDescription').value;
            const imageFiles = document.getElementById('productImages').files;
            
            // Kiểm tra dữ liệu trước khi gửi
            if (!productName || !price || !categoryID) {
                alert('Vui lòng điền đầy đủ thông tin sản phẩm và chọn danh mục');
                return;
            }
            
            try {
                // Lấy token từ localStorage hoặc sessionStorage
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('Bạn chưa đăng nhập');
                }
                
                // Tạo FormData để gửi cả file và dữ liệu
                const formData = new FormData();
                formData.append('productName', productName);
                formData.append('price', price);
                formData.append('categoryID', categoryID);
                formData.append('status', status);
                formData.append('description', description);
                
                // Thêm các file ảnh vào FormData
                if (imageFiles && imageFiles.length > 0) {
                    Array.from(imageFiles).forEach(file => {
                        formData.append('images', file);
                    });
                }
                
                let response;
                if (productId) {
                    // Cập nhật sản phẩm
                    response = await axios.put(`/api/products/${productId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } else {
                    // Tạo sản phẩm mới
                    response = await axios.post('/api/products', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
                
                if (response.data.success) {
                    // Đóng modal và load lại danh sách
                    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                    if (modal) {
                        modal.hide();
                        // Xóa backdrop sau khi đóng modal
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                        }
                        // Xóa class modal-open khỏi body
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    }
                    alert('Lưu sản phẩm thành công');
                    loadProducts();
                } else {
                    throw new Error(response.data.message || 'Có lỗi xảy ra khi lưu sản phẩm');
                }
            } catch (error) {
                console.error('Error saving product:', error);
                alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu sản phẩm');
            }
        });
    }
}

// Hàm thêm event listener cho các nút danh mục
function addCategoryEventListeners() {
    // Nút thêm danh mục
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryForm').reset();
        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    });
    
    // Nút sửa danh mục
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const categoryId = e.target.closest('button').dataset.id;
            try {
                const response = await axios.get(`/api/categories/${categoryId}`);
                const category = response.data.data;
                
                document.getElementById('categoryId').value = category._id;
                document.getElementById('categoryName').value = category.categoryName;
                document.getElementById('categoryDescription').value = category.description;
                
                new bootstrap.Modal(document.getElementById('categoryModal')).show();
            } catch (error) {
                console.error('Error loading category:', error);
                alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải thông tin danh mục');
            }
        });
    });
    
    // Nút xóa danh mục
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const categoryId = e.target.closest('button').dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    if (!token) {
                        throw new Error('Bạn chưa đăng nhập');
                    }

                    const response = await axios.delete(`/api/categories/${categoryId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.success) {
                        alert('Xóa danh mục thành công');
                        loadCategories(); // Load lại danh sách danh mục
                    } else {
                        throw new Error(response.data.message || 'Có lỗi xảy ra khi xóa danh mục');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa danh mục');
                }
            }
        });
    });
    
    // Nút lưu danh mục
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    if (saveCategoryBtn) {
        // Xóa tất cả event listener cũ
        const newSaveCategoryBtn = saveCategoryBtn.cloneNode(true);
        saveCategoryBtn.parentNode.replaceChild(newSaveCategoryBtn, saveCategoryBtn);
        
        // Thêm event listener mới
        newSaveCategoryBtn.addEventListener('click', async () => {
            const categoryId = document.getElementById('categoryId').value;
            
            // Lấy giá trị từ form
            const categoryName = document.getElementById('categoryName').value;
            const description = document.getElementById('categoryDescription').value;
            
            // Kiểm tra dữ liệu trước khi gửi
            if (!categoryName) {
                alert('Vui lòng điền tên danh mục');
                return;
            }
            
            try {
                // Lấy token từ localStorage hoặc sessionStorage
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('Bạn chưa đăng nhập');
                }
                
                const categoryData = {
                    categoryName,
                    description
                };
                
                let response;
                if (categoryId) {
                    // Cập nhật danh mục
                    response = await axios.put(`/api/categories/${categoryId}`, categoryData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } else {
                    // Tạo danh mục mới
                    response = await axios.post('/api/categories', categoryData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
                
                if (response.data.success) {
                    // Đóng modal và load lại danh sách
                    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                    if (modal) {
                        modal.hide();
                        // Xóa backdrop sau khi đóng modal
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                        }
                        // Xóa class modal-open khỏi body
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    }
                    alert('Lưu danh mục thành công');
                    loadCategories();
                } else {
                    throw new Error(response.data.message || 'Có lỗi xảy ra khi lưu danh mục');
                }
            } catch (error) {
                console.error('Error saving category:', error);
                alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu danh mục');
            }
        });
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