/* Login Page Logic for Mini Shop */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Render Header & Footer
  renderHeader('login');
  renderFooter();

  // Redirect if already logged in
  const currentUser = getAuthUser();
  if (currentUser) {
    if (currentUser.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
    return;
  }

  // 2. Elements
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const authAlert = document.getElementById('authAlert');

  const btnDemoCustomer = document.getElementById('btnDemoCustomer');
  const btnDemoAdmin = document.getElementById('btnDemoAdmin');

  // Check query string parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect');
  const messageParam = urlParams.get('msg');

  if (messageParam === 'admin_required') {
    showAlert('Trang này yêu cầu quyền Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản Admin!', 'warning');
  } else if (messageParam === 'login_required') {
    showAlert('Vui lòng đăng nhập để tiếp tục!', 'info');
  }

  // 3. Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.classList.toggle('active', !isPassword);
    });
  }

  // 4. Quick Demo Login Handlers
  if (btnDemoCustomer) {
    btnDemoCustomer.addEventListener('click', () => {
      emailInput.value = 'khachhang@gmail.com';
      passwordInput.value = 'user123';
      performLogin('khachhang@gmail.com', 'user123');
    });
  }

  if (btnDemoAdmin) {
    btnDemoAdmin.addEventListener('click', () => {
      emailInput.value = 'admin@minishop.com';
      passwordInput.value = 'admin123';
      performLogin('admin@minishop.com', 'admin123');
    });
  }

  // 5. Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAlert('Vui lòng nhập đầy đủ Email và Mật khẩu!', 'danger');
        return;
      }

      performLogin(email, password);
    });
  }

  // Perform Login function
  function performLogin(email, password) {
    const result = loginUser(email, password);
    if (result.success) {
      showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      setTimeout(() => {
        if (redirectTarget) {
          window.location.href = redirectTarget;
        } else if (result.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 700);
    } else {
      showAlert(result.message, 'danger');
    }
  }

  // Helper Alert Function
  function showAlert(msg, type = 'info') {
    if (!authAlert) return;
    authAlert.className = `auth-alert alert-${type}`;
    authAlert.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span>${msg}</span>
      </div>
    `;
    authAlert.style.display = 'block';
  }
});
