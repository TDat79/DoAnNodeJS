// Xử lý đăng ký
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Kiểm tra mật khẩu trùng khớp
    if (password !== confirmPassword) {
        alert('Mật khẩu không trùng khớp');
        return;
    }
    
    try {
        const response = await axios.post('/api/auth/signup', {
            username,
            email,
            password
        });
        
        if (response.data.success) {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            // Chuyển sang tab đăng nhập
            document.getElementById('login-tab').click();
        } else {
            alert(response.data.message || 'Đăng ký thất bại');
        }
    } catch (error) {
        console.error('Register error:', error);
        if (error.response?.data?.errors) {
            alert(error.response.data.errors.map(err => err.msg).join('\n'));
        } else {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
        }
    }
}

// Thêm event listener cho form đăng ký
document.getElementById('registerForm')?.addEventListener('submit', handleRegister); 