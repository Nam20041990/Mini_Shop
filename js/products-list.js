/* Product List Page Script (products-list.js) */

function initProductsList() {
  // 1. Render Reusable Header & Footer
  renderHeader('products');
  renderFooter();

  // Parse URL Parameters (e.g., ?cat=trang-tri or ?q=sofa)
  const urlParams = new URLSearchParams(window.location.search);
  let selectedCategory = urlParams.get('cat') || 'all';
  let selectedPriceRange = 'all';
  let inStockOnly = false;
  let currentSort = 'newest';
  let searchQuery = urlParams.get('q') || '';

  // DOM Elements
  const productGridEl = document.getElementById('shopProductGrid');
  const resultsCountEl = document.getElementById('resultsCount');
  const categoryFilterListEl = document.getElementById('categoryFilterList');
  const sortSelectEl = document.getElementById('sortSelect');
  const shopSearchInputEl = document.getElementById('shopSearchInput');
  const inStockCheckboxEl = document.getElementById('inStockFilter');

  // Set initial search input value if present in URL
  if (shopSearchInputEl && searchQuery) {
    shopSearchInputEl.value = searchQuery;
  }

  // Categories Master Data List
  const categoriesList = [
    { id: 'all', name: 'Tất cả sản phẩm', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { id: 'noi-that', name: 'Nội thất', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path><path d="M4 17v4"></path><path d="M20 17v4"></path></svg>' },
    { id: 'trang-tri', name: 'Trang trí', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
    { id: 'nha-bep', name: 'Nhà bếp', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v20M6 2v20M12 2v20"></path></svg>' },
    { id: 'den', name: 'Đèn', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M15 8a3 3 0 1 0-6 0c0 1.66.75 3.15 2 4.17V15a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-2.83A5.002 5.002 0 0 0 15 8z"></path></svg>' },
    { id: 'luu-tru', name: 'Lưu trữ', icon: '<svg class="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' }
  ];

  // Render Sidebar Category Filter
  function renderCategorySidebar() {
    if (!categoryFilterListEl) return;
    const allProds = typeof getStoreCatalogProducts === 'function' ? getStoreCatalogProducts() : PRODUCTS_DATA;

    categoryFilterListEl.innerHTML = categoriesList.map(cat => {
      const count = cat.id === 'all' 
        ? allProds.length 
        : allProds.filter(p => p.category === cat.id).length;

      const isActive = cat.id === selectedCategory;

      return `
        <li>
          <button type="button" class="filter-item-btn ${isActive ? 'active' : ''}" data-cat="${cat.id}">
            <div class="filter-item-left">
              ${cat.icon}
              <span>${cat.name}</span>
            </div>
            <span class="filter-count">${count}</span>
          </button>
        </li>
      `;
    }).join('');
  }

  // Filter Computation Logic
  function getFilteredProducts() {
    const allProds = typeof getStoreCatalogProducts === 'function' ? getStoreCatalogProducts() : PRODUCTS_DATA;
    let list = [...allProds];

    // 1. Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 2. Filter by Price Range
    if (selectedPriceRange === 'under-500k') {
      list = list.filter(p => p.price < 500000);
    } else if (selectedPriceRange === '500k-1m') {
      list = list.filter(p => p.price >= 500000 && p.price <= 1000000);
    } else if (selectedPriceRange === '1m-3m') {
      list = list.filter(p => p.price > 1000000 && p.price <= 3000000);
    } else if (selectedPriceRange === 'over-3m') {
      list = list.filter(p => p.price > 3000000);
    }

    // 3. Filter by In Stock
    if (inStockOnly) {
      list = list.filter(p => p.inStock);
    }

    // 4. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    }

    // 5. Sorting
    if (currentSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }

  // Smooth DOM Re-rendering without page reload
  function renderProductsGrid() {
    if (!productGridEl) return;

    const filteredList = getFilteredProducts();

    // Update Results Count Text
    if (resultsCountEl) {
      const catObj = categoriesList.find(c => c.id === selectedCategory);
      const catName = catObj ? catObj.name : 'Tất cả';
      if (searchQuery.trim()) {
        resultsCountEl.textContent = `Tìm thấy ${filteredList.length} kết quả cho "${searchQuery}"`;
      } else {
        resultsCountEl.textContent = `Hiển thị 1–${filteredList.length} trong ${filteredList.length} sản phẩm (${catName})`;
      }
    }

    // Handle Empty State
    if (filteredList.length === 0) {
      productGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); background-color: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color); animation: fadeIn 0.3s ease;">
          <svg style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--text-light);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Không tìm thấy sản phẩm phù hợp</p>
          <p style="font-size: 0.9rem; margin-bottom: 1.25rem;">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục "Tất cả sản phẩm".</p>
          <button type="button" class="btn btn-outline" id="resetFiltersBtn">Hiển thị tất cả sản phẩm</button>
        </div>
      `;

      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          selectedCategory = 'all';
          searchQuery = '';
          selectedPriceRange = 'all';
          inStockOnly = false;
          if (shopSearchInputEl) shopSearchInputEl.value = '';
          document.querySelectorAll('input[name="price-range"]').forEach(r => r.checked = (r.value === 'all'));
          if (inStockCheckboxEl) inStockCheckboxEl.checked = false;
          renderCategorySidebar();
          renderProductsGrid();
        });
      }
      return;
    }

    // Render Product Cards Grid
    productGridEl.innerHTML = filteredList.map(p => {
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
          <div class="price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          ${p.inStock ? `
            <span class="stock-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Còn hàng</span>
            </span>
          ` : ''}
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

  // Event Listener 1: Category Sidebar Click (Instant Filter without Page Reload)
  if (categoryFilterListEl) {
    categoryFilterListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-item-btn');
      if (!btn) return;
      
      selectedCategory = btn.dataset.cat;
      renderCategorySidebar();
      renderProductsGrid();
    });
  }

  // Event Listener 2: Real-time Search Input Filter (Live Typing)
  if (shopSearchInputEl) {
    shopSearchInputEl.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProductsGrid();
    });
  }

  // Event Listener 3: Header Search Input Linkage
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'searchInput') {
      searchQuery = e.target.value;
      if (shopSearchInputEl) shopSearchInputEl.value = searchQuery;
      renderProductsGrid();
    }
  });

  // Event Listener 4: Price Range Filter Radio Buttons
  document.querySelectorAll('input[name="price-range"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPriceRange = e.target.value;
      renderProductsGrid();
    });
  });

  // Event Listener 5: Stock Status Checkbox
  if (inStockCheckboxEl) {
    inStockCheckboxEl.addEventListener('change', (e) => {
      inStockOnly = e.target.checked;
      renderProductsGrid();
    });
  }

  // Event Listener 6: Sort Dropdown
  if (sortSelectEl) {
    sortSelectEl.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProductsGrid();
    });
  }

  // Initial Execution
  renderCategorySidebar();
  renderProductsGrid();
}

// Execute immediately if DOM is ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductsList);
} else {
  initProductsList();
}
