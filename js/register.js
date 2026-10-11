/* Register Page Logic for Mini Shop */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Render Header & Footer
  renderHeader('register');
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
  const registerForm = document.getElementById('registerForm');
  const fullnameInput = document.getElementById('fullnameInput');
  const regEmailInput = document.getElementById('regEmailInput');
  const roleSelect = document.getElementById('roleSelect');
  const regPasswordInput = document.getElementById('regPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const agreeTermsCheckbox = document.getElementById('agreeTermsCheckbox');
  const authAlert = document.getElementById('authAlert');

  // 3. Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = fullnameInput.value.trim();
      const email = regEmailInput.value.trim();
      const role = roleSelect.value;
      const password = regPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const agree = agreeTermsCheckbox.checked;

      // Validation
      if (!fullname) {
        showAlert('Vui lòng nhập Họ và tên!', 'danger');
        fullnameInput.focus();
        return;
      }

      if (!email || !validateEmail(email)) {
        showAlert('Vui lòng nhập Địa chỉ Email hợp lệ!', 'danger');
        regEmailInput.focus();
        return;
      }

      if (!password || password.length < 4) {
        showAlert('Mật khẩu phải có ít nhất 4 ký tự!', 'danger');
        regPasswordInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Mật khẩu xác nhận không trùng khớp!', 'danger');
        confirmPasswordInput.focus();
        return;
      }

      if (!agree) {
        showAlert('Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục!', 'warning');
        return;
      }

      // Perform registration
      const result = registerUser(fullname, email, password, role);

      if (result.success) {
        showAlert('Đăng ký tài khoản thành công! Tự động đăng nhập...', 'success');

        setTimeout(() => {
          if (result.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      } else {
        showAlert(result.message, 'danger');
      }
    });
  }

  // Helper Email Validator
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
