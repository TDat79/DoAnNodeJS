// Xử lý đăng nhập
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        const response = await axios.post('/api/auth/login', {
            username,
            password
        });
        
        console.log('Login response:', response.data); // Debug log
        
        if (response.data.success) {
            const { token, user } = response.data.data;
            
            // Lưu token và user
            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));
            }
            
            // Chuyển hướng dựa trên role
            if (user.role?.roleName === 'ADMIN') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            alert(response.data.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error response:', error.response?.data);
        if (error.response?.data?.errors) {
            alert(error.response.data.errors.map(err => err.msg).join('\n'));
        } else {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
        }
    }
}

// Thêm event listener cho form đăng nhập
document.getElementById('loginForm')?.addEventListener('submit', handleLogin); 