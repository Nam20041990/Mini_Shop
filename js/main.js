/* Main Homepage Script for Mini Shop */

function initMainHome() {
  // 1. Render Reusable Header & Footer
  renderHeader('home');
  renderFooter();

  // 2. Category list definitions matching reference layout
  const categories = [
    { id: 'all', name: 'Tất cả', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { id: 'noi-that', name: 'Nội thất', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path><path d="M4 17v4"></path><path d="M20 17v4"></path></svg>' },
    { id: 'trang-tri', name: 'Trang trí', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
    { id: 'nha-bep', name: 'Nhà bếp', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v20M6 2v20M12 2v20"></path></svg>' },
    { id: 'den', name: 'Đèn', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M15 8a3 3 0 1 0-6 0c0 1.66.75 3.15 2 4.17V15a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-2.83A5.002 5.002 0 0 0 15 8z"></path></svg>' },
    { id: 'van-phong', name: 'Văn phòng', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
    { id: 'luu-tru', name: 'Lưu trữ', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' },
    { id: 'khac', name: 'Khác', icon: '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' }
  ];

  let currentCategory = 'all';
  let searchQuery = '';

  // Render Category Bar
  const categoriesBar = document.getElementById('categoriesBar');
  if (categoriesBar) {
    categoriesBar.innerHTML = categories.map(cat => `
      <button class="cat-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.icon}
        <span>${cat.name}</span>
      </button>
    `).join('');

    categoriesBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      
      const selectedCat = btn.dataset.cat;
      currentCategory = selectedCat;

      // Update active state
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderProducts();
    });
  }

  // Render Product Grid Function
  function renderProducts() {
    const productGrid = document.getElementById('featuredProductGrid');
    if (!productGrid) return;

    let filtered = typeof getHomepageProducts === 'function' ? getHomepageProducts() : PRODUCTS_DATA;

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Không tìm thấy sản phẩm phù hợp</p>
          <p style="font-size: 0.9rem;">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục "Tất cả".</p>
        </div>
      `;
      return;
    }

    productGrid.innerHTML = filtered.map(p => {
      const activeWish = typeof isWishlisted === 'function' && isWishlisted(p.id);
      return `
      <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor: pointer;">
        <div class="product-thumb">
          ${p.badge ? `<span class="badge-tag ${p.badgeType || 'new'}">${p.badge}</span>` : ''}
          <button type="button" class="btn-wishlist ${activeWish ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
            <svg viewBox="0 0 24 24" fill="${activeWish ? 'var(--danger-color)' : 'none'}" stroke="${activeWish ? 'var(--danger-color)' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-name"><a href="product-detail.html?id=${p.id}" onclick="event.stopPropagation()">${p.name}</a></h3>
          <div class="product-price">${formatPrice(p.price)}</div>
          <p class="product-desc">${p.desc}</p>
          <div class="card-action-row">
            <button type="button" class="btn-card-add-cart" onclick="event.stopPropagation(); addToCart(${p.id}, 1)" title="Thêm vào giỏ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Thêm giỏ</span>
            </button>
            <a href="product-detail.html?id=${p.id}" class="btn-detail" onclick="event.stopPropagation()">
              <span>Chi tiết</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
    }).join('');
  }

  // Initial Product Render
  renderProducts();

  // Handle Search Input in Header
  document.addEventListener('input', (e) => {
    if (e.target && e.target.classList.contains('search-input')) {
      searchQuery = e.target.value;
      renderProducts();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMainHome);
} else {
  initMainHome();
}
