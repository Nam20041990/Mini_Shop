/* Authentication & User Management Module for Mini Shop (Mock Auth) */

const MOCK_ADMIN_ACCOUNT = {
  id: 'admin-001',
  name: 'Quản trị viên Admin',
  email: 'admin@minishop.com',
  password: 'admin123',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
};

const MOCK_CUSTOMER_ACCOUNT = {
  id: 'user-001',
  name: 'Nguyễn Văn Khách',
  email: 'khachhang@gmail.com',
  password: 'user123',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
};

// Key in localStorage
const AUTH_STORAGE_KEY = 'mini_shop_current_user';
const USERS_STORAGE_KEY = 'mini_shop_registered_users';

// Initialize default users pool in localStorage if empty
function initRegisteredUsers() {
  const existing = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existing) {
    const defaultUsers = [MOCK_ADMIN_ACCOUNT, MOCK_CUSTOMER_ACCOUNT];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    return [MOCK_ADMIN_ACCOUNT, MOCK_CUSTOMER_ACCOUNT];
  }
}

// Get currently logged-in user
function getAuthUser() {
  const userData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch (e) {
    return null;
  }
}

// Set logged in user
function setAuthUser(user) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

// Check if user is logged in
function isAuthenticated() {
  return getAuthUser() !== null;
}

// Check if user is admin
function isAdminUser() {
  const user = getAuthUser();
  return user && user.role === 'admin';
}

// Login function
function loginUser(email, password) {
  const users = initRegisteredUsers();
  const foundUser = users.find(
    u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
  );

  if (foundUser) {
    // Save to auth storage
    const safeUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };
    setAuthUser(safeUser);
    return { success: true, user: safeUser, role: safeUser.role, message: 'Đăng nhập thành công!' };
  } else {
    return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
  }
}

// Register function
function registerUser(name, email, password, role = 'customer') {
  const users = initRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  
  if (existing) {
    return { success: false, message: 'Email này đã được đăng ký tài khoản!' };
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: role,
    avatar: role === 'admin' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Automatically log in newly registered user
  const safeUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatar: newUser.avatar
  };
  setAuthUser(safeUser);

  return { success: true, user: safeUser, role: safeUser.role, message: 'Đăng ký tài khoản thành công!' };
}

// Logout function
function logoutUser(redirect = true) {
  setAuthUser(null);
  if (redirect) {
    window.location.href = 'login.html';
  }
}

// Global initialization
initRegisteredUsers();
