/* Modular Reusable Header Component for Mini Shop */

function renderHeader(activePage = 'home') {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  const pages = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'categories', label: 'Categories', href: 'products.html', hasDropdown: true },
    { id: 'products', label: 'Products', href: 'products.html' },
    { id: 'new-arrivals', label: 'New Arrivals', href: 'products.html' },
    { id: 'sale', label: 'Sale', href: 'products.html' },
    { id: 'blog', label: 'Blog', href: '#' },
    { id: 'contact', label: 'Contact', href: 'contact.html' }
  ];

  const navItemsHtml = pages.map(page => {
    if (page.hasDropdown) {
      return `
        <li class="has-dropdown">
          <a href="${page.href}" class="${page.id === activePage ? 'active' : ''}">
            <span>${page.label}</span>
            <svg class="nav-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          <ul class="dropdown-menu">
            <li><a href="products.html?cat=all">Tất cả sản phẩm</a></li>
            <li><a href="products.html?cat=noi-that">Nội thất</a></li>
            <li><a href="products.html?cat=trang-tri">Trang trí (Decor)</a></li>
            <li><a href="products.html?cat=nha-bep">Nhà bếp</a></li>
            <li><a href="products.html?cat=den">Đèn</a></li>
            <li><a href="products.html?cat=luu-tru">Lưu trữ</a></li>
          </ul>
        </li>
      `;
    }
    return `
      <li>
        <a href="${page.href}" class="${page.id === activePage ? 'active' : ''}">${page.label}</a>
      </li>
    `;
  }).join('');

  const currentUser = typeof getAuthUser === 'function' ? getAuthUser() : null;

  let desktopAuthHtml = '';
  let mobileAuthHtml = '';

  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    const roleBadgeText = isAdmin ? 'Quản trị viên' : 'Khách hàng';

    desktopAuthHtml = `
      <a href="wishlist.html" class="wishlist-btn-header ${activePage === 'wishlist' ? 'active' : ''}" title="Danh sách yêu thích">
        <div class="wishlist-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="wishlist-badge" id="headerWishlistBadge">0</span>
        </div>
        <span class="wishlist-btn-text">Yêu thích</span>
      </a>
      <a href="cart.html" class="cart-btn-header ${activePage === 'cart' ? 'active' : ''}" title="Giỏ hàng">
        <div class="cart-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-badge" id="headerCartBadge">0</span>
        </div>
        <span class="cart-btn-text">Giỏ hàng</span>
      </a>
      ${isAdmin ? `
        <a href="admin.html" class="btn btn-blue btn-admin-header ${activePage === 'admin' ? 'active' : ''}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>Khu quản trị</span>
        </a>
      ` : ''}
      <div class="user-menu-wrapper">
        <button type="button" class="user-menu-btn" id="userMenuBtn">
          <img src="${currentUser.avatar}" class="user-avatar-img" alt="${currentUser.name}">
          <span class="user-name-text">${currentUser.name}</span>
          <svg class="dropdown-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="user-dropdown-card" id="userDropdownCard">
          <div class="user-dropdown-header">
            <div class="user-info-row">
              <img src="${currentUser.avatar}" class="user-avatar-lg" alt="${currentUser.name}">
              <div>
                <strong class="user-display-name">${currentUser.name}</strong>
                <span class="user-role-tag ${currentUser.role}">${isAdmin ? '🛡️ Admin' : '👤 Khách'}</span>
                <span class="user-email-text">${currentUser.email}</span>
              </div>
            </div>
          </div>
          <div class="user-dropdown-divider"></div>
          ${isAdmin ? '<a href="admin.html" class="user-dropdown-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>Khu quản trị Admin</span></a>' : ''}
          <a href="products.html" class="user-dropdown-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg><span>Sản phẩm cửa hàng</span></a>
          <button type="button" class="user-dropdown-item logout-btn" onclick="logoutUser()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    `;

    mobileAuthHtml = `
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <img src="${currentUser.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
          <div>
            <strong style="font-size: 0.85rem; display: block;">${currentUser.name}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${roleBadgeText}</span>
          </div>
        </div>
        <button type="button" onclick="logoutUser()" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--danger-color); border-color: var(--danger-color);">Đăng xuất</button>
      </div>
      <a href="wishlist.html" class="btn btn-outline" style="flex: 1 1 48%; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>Yêu thích (<span class="wishlist-badge">0</span>)</span>
      </a>
      <a href="cart.html" class="btn btn-primary" style="flex: 1 1 48%; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Giỏ hàng (<span class="cart-badge">0</span>)</span>
      </a>
      ${isAdmin ? '<a href="admin.html" class="btn btn-blue" style="flex:1 1 100%; text-align:center;">🛡️ Khu quản trị Admin</a>' : ''}
    `;
  } else {
    desktopAuthHtml = `
      <a href="wishlist.html" class="wishlist-btn-header ${activePage === 'wishlist' ? 'active' : ''}" title="Danh sách yêu thích">
        <div class="wishlist-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="wishlist-badge" id="headerWishlistBadge">0</span>
        </div>
        <span class="wishlist-btn-text">Yêu thích</span>
      </a>
      <a href="cart.html" class="cart-btn-header ${activePage === 'cart' ? 'active' : ''}" title="Giỏ hàng">
        <div class="cart-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-badge" id="headerCartBadge">0</span>
        </div>
        <span class="cart-btn-text">Giỏ hàng</span>
      </a>
      <a href="login.html" class="auth-link ${activePage === 'login' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Đăng nhập</span>
      </a>
      <a href="register.html" class="auth-link ${activePage === 'register' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
        <span>Đăng ký</span>
      </a>
      <a href="admin.html" class="btn btn-blue btn-admin-header ${activePage === 'admin' ? 'active' : ''}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>Admin</span>
      </a>
    `;

    mobileAuthHtml = `
      <a href="wishlist.html" class="btn btn-outline" style="flex: 1 1 48%; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>Yêu thích (<span class="wishlist-badge">0</span>)</span>
      </a>
      <a href="cart.html" class="btn btn-primary" style="flex: 1 1 48%; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Giỏ hàng (<span class="cart-badge">0</span>)</span>
      </a>
      <a href="login.html" class="btn btn-outline" style="flex:1; text-align:center;">Đăng nhập</a>
      <a href="register.html" class="btn btn-blue" style="flex:1; text-align:center;">Đăng ký</a>
      <a href="admin.html" class="btn btn-admin" style="flex:1; text-align:center;">Admin</a>
    `;
  }

  const headerHtml = `
    <header class="site-header">
      <div class="container header-container">
        <!-- Logo -->
        <a href="index.html" class="logo">
          <div class="logo-icon-box">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
            </svg>
          </div>
          <span class="logo-text">Mini Shop</span>
        </a>

        <!-- Desktop Navigation Links -->
        <nav>
          <ul class="nav-links">
            ${navItemsHtml}
          </ul>
        </nav>

        <!-- Search Bar and Action Buttons -->
        <div class="header-actions">
          <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Search products...">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div class="auth-buttons">
            ${desktopAuthHtml}
          </div>

          <!-- Mobile Hamburger Toggle Button -->
          <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      <div class="mobile-menu" id="mobileMenu">
        <ul class="mobile-nav-links">
          ${navItemsHtml}
        </ul>
        <div class="mobile-search" style="margin-top: 0.5rem;">
          <input type="text" class="search-input" placeholder="Search products..." style="width: 100%;">
        </div>
        <div class="auth-buttons" style="display: flex; gap: 0.5rem; width: 100%; margin-top: 0.5rem; flex-wrap: wrap;">
          ${mobileAuthHtml}
        </div>
      </div>
    </header>
  `;

  headerContainer.innerHTML = headerHtml;

  // User menu toggle logic
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdownCard = document.getElementById('userDropdownCard');
  if (userMenuBtn && userDropdownCard) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownCard.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userDropdownCard.contains(e.target)) {
        userDropdownCard.classList.remove('active');
      }
    });
  }

  // Add mobile menu toggle logic
  const toggleBtn = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // Update Cart & Wishlist badge counts
  if (typeof updateHeaderCartBadge === 'function') {
    updateHeaderCartBadge();
  }
  if (typeof updateHeaderWishlistBadge === 'function') {
    updateHeaderWishlistBadge();
  }
}
