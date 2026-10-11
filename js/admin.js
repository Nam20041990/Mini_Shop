/* Mini Shop Admin Panel JavaScript (js/admin.js) */

// Key for stored admin products data in localStorage
const ADMIN_PRODUCTS_STORAGE_KEY = 'mini_shop_admin_products';
const ADMIN_ORDERS_STORAGE_KEY = 'mini_shop_admin_orders';

// In-memory data store initialized from localStorage or default PRODUCTS_DATA
let adminProductsData = [];
let adminOrdersData = [];

// Default mock orders list
const DEFAULT_MOCK_ORDERS = [
  { id: 'DH-9821', customer: 'Nguyễn Văn Khách', items: 'Lọ hoa gốm sứ Bát Tràng (x2)', date: '10/10/2026', total: 420000, status: 'Completed' },
  { id: 'DH-9822', customer: 'Trần Thị Minh', items: 'Đèn ngủ gỗ để bàn Vintage (x1)', date: '10/10/2026', total: 850000, status: 'Processing' },
  { id: 'DH-9823', customer: 'Lê Hoàng Nam', items: 'Khay mây tre đan cao cấp (x1)', date: '09/10/2026', total: 310000, status: 'Delivering' },
  { id: 'DH-9824', customer: 'Phạm Thị Hương', items: 'Đồng hồ treo tường gỗ tự nhiên (x1)', date: '08/10/2026', total: 680000, status: 'Completed' },
  { id: 'DH-9825', customer: 'Đỗ Quốc Tuấn', items: 'Thảm trải sàn dệt tay Bohemia (x1)', date: '07/10/2026', total: 1250000, status: 'Cancelled' }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Authentication Check
  checkAdminAccess();

  // 2. Initialize Data
  initAdminData();

  // 3. Setup Navigation & Event Listeners
  setupNavigation();
  setupProductForm();
  setupGlobalSearch();

  // 4. Initial Render
  renderAllAdminScreens();
});

// --------------------------------------------------------------------------
// 1. Authentication Check
// --------------------------------------------------------------------------
function checkAdminAccess() {
  const accessDeniedEl = document.getElementById('adminAccessDenied');
  const dashboardContentEl = document.getElementById('adminDashboardContent');
  const btnQuickAdminLogin = document.getElementById('btnQuickAdminLogin');

  const currentUser = typeof getAuthUser === 'function' ? getAuthUser() : null;
  const isUserAdmin = currentUser && currentUser.role === 'admin';

  if (!isUserAdmin) {
    if (accessDeniedEl) accessDeniedEl.style.display = 'block';
    if (dashboardContentEl) dashboardContentEl.style.display = 'none';

    if (btnQuickAdminLogin) {
      btnQuickAdminLogin.addEventListener('click', () => {
        if (typeof loginUser === 'function') {
          const res = loginUser('admin@minishop.com', 'admin123');
          if (res.success) {
            window.location.reload();
          }
        }
      });
    }
  } else {
    if (accessDeniedEl) accessDeniedEl.style.display = 'none';
    if (dashboardContentEl) dashboardContentEl.style.display = 'block';

    const topAdminName = document.getElementById('topAdminName');
    if (topAdminName && currentUser) {
      topAdminName.textContent = currentUser.name || 'Admin';
    }
  }
}

// --------------------------------------------------------------------------
// 2. Initialize Data Store
// --------------------------------------------------------------------------
function initAdminData() {
  // Load products
  const storedProds = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
  if (storedProds) {
    try {
      adminProductsData = JSON.parse(storedProds);
    } catch (e) {
      adminProductsData = [...PRODUCTS_DATA];
    }
  } else {
    adminProductsData = typeof PRODUCTS_DATA !== 'undefined' ? [...PRODUCTS_DATA] : [];
    saveProductsData();
  }

  // Load orders
  const storedOrders = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
  if (storedOrders) {
    try {
      adminOrdersData = JSON.parse(storedOrders);
    } catch (e) {
      adminOrdersData = [...DEFAULT_MOCK_ORDERS];
    }
  } else {
    adminOrdersData = [...DEFAULT_MOCK_ORDERS];
    saveOrdersData();
  }
}

function saveProductsData() {
  localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(adminProductsData));
}

function saveOrdersData() {
  localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(adminOrdersData));
}

// --------------------------------------------------------------------------
// 3. Navigation Logic (Switch screens)
// --------------------------------------------------------------------------
function setupNavigation() {
  const navBtns = document.querySelectorAll('.sidebar-menu .nav-item');
  const screenTitleText = document.getElementById('screenTitleText');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.dataset.screen;
      switchAdminScreen(screenId);
    });
  });

  // Toggle sidebar for mobile
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const adminSidebar = document.getElementById('adminSidebar');
  if (btnToggleSidebar && adminSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      adminSidebar.classList.toggle('collapsed');
    });
  }
}

function switchAdminScreen(screenId) {
  const navBtns = document.querySelectorAll('.sidebar-menu .nav-item');
  const screens = document.querySelectorAll('.admin-screen');
  const screenTitleText = document.getElementById('screenTitleText');

  navBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenId);
  });

  screens.forEach(s => {
    s.classList.remove('active');
  });

  const targetScreen = document.getElementById(`screen${capitalize(screenId)}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Update header title
  const titles = {
    dashboard: 'Dashboard Overview',
    categories: 'Categories Management',
    products: 'Product Management',
    orders: 'Orders Management',
    users: 'User Account Management',
    settings: 'Store Settings'
  };

  if (screenTitleText) {
    screenTitleText.textContent = titles[screenId] || 'Admin Dashboard';
  }

  // Re-render target screen data
  renderAllAdminScreens();
}

// --------------------------------------------------------------------------
// 4. Render All Screens Data
// --------------------------------------------------------------------------
function renderAllAdminScreens() {
  updateSidebarMetrics();
  renderDashboardScreen();
  renderProductsManagementScreen();
  renderOrdersManagementScreen();
  renderCategoriesScreen();
  renderUsersScreen();
}

function updateSidebarMetrics() {
  const sbProductCount = document.getElementById('sbProductCount');
  const sbCatCount = document.getElementById('sbCatCount');
  const sbOrderCount = document.getElementById('sbOrderCount');

  if (sbProductCount) sbProductCount.textContent = adminProductsData.length;
  if (sbCatCount) sbCatCount.textContent = '6';
  if (sbOrderCount) sbOrderCount.textContent = adminOrdersData.length;
}

// --------------------------------------------------------------------------
// SCREEN 1: Dashboard Renderer
// --------------------------------------------------------------------------
function renderDashboardScreen() {
  const totalCount = adminProductsData.length;
  const visibleCount = adminProductsData.filter(p => p.status !== 'Inactive').length;
  const lowStockCount = adminProductsData.filter(p => p.stock && p.stock < 10).length || 3;

  const metricTotalProducts = document.getElementById('metricTotalProducts');
  const metricVisibleProducts = document.getElementById('metricVisibleProducts');
  const metricLowStock = document.getElementById('metricLowStock');

  if (metricTotalProducts) metricTotalProducts.textContent = totalCount;
  if (metricVisibleProducts) metricVisibleProducts.textContent = visibleCount;
  if (metricLowStock) metricLowStock.textContent = lowStockCount;

  // Render recent products in dashboard (image 1 style)
  const tbody = document.getElementById('dashRecentProductsBody');
  if (!tbody) return;

  const recentList = adminProductsData.slice(0, 5);

  tbody.innerHTML = recentList.map(p => {
    const stock = p.stock !== undefined ? p.stock : 18;
    let statusBadge = '<span class="badge-status status-success">Visible</span>';
    if (stock <= 0) {
      statusBadge = '<span class="badge-status status-danger">Out of stock</span>';
    } else if (stock < 10) {
      statusBadge = '<span class="badge-status status-warning">Low stock</span>';
    } else if (p.status === 'Inactive') {
      statusBadge = '<span class="badge-status status-muted">Inactive</span>';
    }

    return `
      <tr>
        <td>
          <div class="prod-flex-cell">
            <img src="${p.image}" alt="${p.name}" class="table-prod-img">
            <div>
              <strong class="prod-name-title">${p.name}</strong>
              <span class="prod-sub-cat">${getCategoryName(p.category)}</span>
            </div>
          </div>
        </td>
        <td><strong>${formatPriceVND(p.price)}</strong></td>
        <td>${stock}</td>
        <td>${statusBadge}</td>
        <td>
          <button type="button" class="btn-icon-dots" onclick="editProductFromAdmin(${p.id})">
            ✏️ Sửa
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// SCREEN 2: Products & Categories Management (Image 2 style)
// --------------------------------------------------------------------------
function renderProductsManagementScreen() {
  const tbody = document.getElementById('mgmtProductsTableBody');
  const pagText = document.getElementById('pagText');
  if (!tbody) return;

  const searchQuery = (document.getElementById('productSearchInput')?.value || '').toLowerCase().trim();

  let filtered = adminProductsData;
  if (searchQuery) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || getCategoryName(p.category).toLowerCase().includes(searchQuery));
  }

  if (pagText) {
    pagText.textContent = `Showing 1 to ${filtered.length} of ${adminProductsData.length} results`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted" style="padding: 2rem;">
          Không tìm thấy sản phẩm phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((p, idx) => {
    const isInactive = p.status === 'Inactive';
    const statusBadge = isInactive
      ? '<span class="badge-status status-danger">• Inactive</span>'
      : '<span class="badge-status status-success">• Active</span>';

    const homeBadge = p.showOnHome !== false
      ? '<span class="badge-status status-info" style="margin-left: 4px;">🏠 Trang chủ</span>'
      : '';

    return `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td>
          <img src="${p.image}" alt="${p.name}" class="table-prod-img">
        </td>
        <td>
          <strong class="prod-name-title">${p.name}</strong>
        </td>
        <td>
          <span class="cat-pill">${getCategoryName(p.category)}</span>
        </td>
        <td>
          <strong class="price-text">${formatPriceVND(p.price)}</strong>
        </td>
        <td>${statusBadge}${homeBadge}</td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn btn-outline btn-xs" onclick="editProductFromAdmin(${p.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn btn-danger-outline btn-xs" onclick="deleteProductFromAdmin(${p.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// SCREEN 3: Orders Management Screen
// --------------------------------------------------------------------------
let currentOrderFilter = 'all';

function renderOrdersManagementScreen() {
  const tbody = document.getElementById('mgmtOrdersTableBody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('orderSearchInput')?.value || '').toLowerCase().trim();

  let filtered = adminOrdersData;

  if (currentOrderFilter !== 'all') {
    filtered = filtered.filter(o => o.status === currentOrderFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(o => o.id.toLowerCase().includes(searchQuery) || o.customer.toLowerCase().includes(searchQuery));
  }

  tbody.innerHTML = filtered.map(o => {
    let badgeClass = 'status-info';
    let labelText = o.status;
    if (o.status === 'Completed') { badgeClass = 'status-success'; labelText = 'Hoàn thành'; }
    if (o.status === 'Processing') { badgeClass = 'status-warning'; labelText = 'Đang xử lý'; }
    if (o.status === 'Delivering') { badgeClass = 'status-info'; labelText = 'Đang giao hàng'; }
    if (o.status === 'Cancelled') { badgeClass = 'status-danger'; labelText = 'Đã hủy'; }

    return `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>
          <strong>${o.customer}</strong>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${o.items}</span>
        </td>
        <td>${o.date}</td>
        <td><strong class="price-text">${formatPriceVND(o.total)}</strong></td>
        <td>
          <span class="badge-status ${badgeClass}">${labelText}</span>
        </td>
        <td>
          <select class="form-select-xs" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Hoàn thành</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Đang xử lý</option>
            <option value="Delivering" ${o.status === 'Delivering' ? 'selected' : ''}>Đang giao hàng</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function filterOrdersByStatus(status) {
  currentOrderFilter = status;

  document.querySelectorAll('.ord-stat-chip').forEach(c => c.classList.remove('active'));
  event.currentTarget.classList.add('active');

  renderOrdersManagementScreen();
}

function updateOrderStatus(orderId, newStatus) {
  const target = adminOrdersData.find(o => o.id === orderId);
  if (target) {
    target.status = newStatus;
    saveOrdersData();
    renderOrdersManagementScreen();
    renderDashboardScreen();
  }
}

// --------------------------------------------------------------------------
// SCREEN 4 & 5: Categories & Users Renderers
// --------------------------------------------------------------------------
function renderCategoriesScreen() {
  const categories = [
    { id: 1, name: 'Nội thất', count: adminProductsData.filter(p => p.category === 'noi-that').length, status: 'Active' },
    { id: 2, name: 'Trang trí (Decor)', count: adminProductsData.filter(p => p.category === 'trang-tri').length, status: 'Active' },
    { id: 3, name: 'Đèn trang trí', count: adminProductsData.filter(p => p.category === 'den').length, status: 'Active' },
    { id: 4, name: 'Nhà bếp', count: adminProductsData.filter(p => p.category === 'nha-bep').length, status: 'Active' },
    { id: 5, name: 'Văn phòng', count: adminProductsData.filter(p => p.category === 'van-phong').length, status: 'Active' },
    { id: 6, name: 'Lưu trữ', count: adminProductsData.filter(p => p.category === 'luu-tru').length, status: 'Active' }
  ];

  const tbody1 = document.getElementById('mgmtCategoriesTableBody');
  const tbody2 = document.getElementById('fullCategoriesTableBody');

  const html = categories.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.count} sản phẩm</td>
      <td><span class="badge-status status-success">• Active</span></td>
      <td>
        <button class="btn btn-outline btn-xs" onclick="alert('Sửa danh mục ${c.name}')">Edit</button>
      </td>
    </tr>
  `).join('');

  if (tbody1) tbody1.innerHTML = html;
  if (tbody2) tbody2.innerHTML = html;
}

function renderUsersScreen() {
  const tbody = document.getElementById('mgmtUsersTableBody');
  if (!tbody) return;

  const users = typeof initRegisteredUsers === 'function' ? initRegisteredUsers() : [];

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="prod-flex-cell">
          <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}" class="table-user-avatar">
          <strong>${u.name}</strong>
        </div>
      </td>
      <td>${u.email}</td>
      <td>
        <span class="user-role-tag ${u.role}">${u.role === 'admin' ? '🛡️ Admin' : '👤 Khách'}</span>
      </td>
      <td>10/10/2026</td>
      <td><span class="badge-status status-success">Hoạt động</span></td>
      <td>
        <button class="btn btn-outline btn-xs" onclick="alert('Xem chi tiết người dùng ${u.name}')">Chi tiết</button>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// 5. Form Handling (Add / Edit Product)
// --------------------------------------------------------------------------
function setupProductForm() {
  const form = document.getElementById('adminProductForm');
  if (!form) return;

  // 1. Submit event handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const productId = document.getElementById('formProductId').value;
    const name = document.getElementById('formProductName').value.trim();
    const category = document.getElementById('formProductCategory').value;
    const price = parseInt(document.getElementById('formProductPrice').value, 10) || 0;
    const image = document.getElementById('formProductImage').value.trim() || 'assets/images/products/den-go-de-ban.webp';
    const status = document.getElementById('formProductStatus').value;
    const showOnHome = document.getElementById('formProductShowOnHome')
      ? document.getElementById('formProductShowOnHome').checked
      : true;
    const desc = document.getElementById('formProductDesc').value.trim();

    if (!name || price <= 0) {
      alert('Vui lòng nhập tên sản phẩm và giá bán hợp lệ!');
      return;
    }

    if (productId) {
      // Update existing product
      const target = adminProductsData.find(p => p.id == productId);
      if (target) {
        target.name = name;
        target.category = category;
        target.price = price;
        target.image = image;
        target.status = status;
        target.showOnHome = showOnHome;
        target.desc = desc;
      }
    } else {
      // Create new product
      const newId = Date.now();
      const newProduct = {
        id: newId,
        name: name,
        category: category,
        price: price,
        oldPrice: Math.round(price * 1.2),
        discount: '-15%',
        image: image,
        status: status,
        showOnHome: showOnHome,
        desc: desc,
        inStock: true,
        stock: 25,
        rating: 5.0,
        reviewsCount: 1,
        badge: 'NEW',
        badgeType: 'new'
      };
      adminProductsData.unshift(newProduct);
    }

    saveProductsData();
    resetProductForm();
    renderAllAdminScreens();

    alert('Đã lưu thông tin sản phẩm và cập nhật hiển thị ngoài Trang Chủ thành công!');
  });

  // 2. Setup File Input Picker & Drag and Drop
  const fileInput = document.getElementById('formProductFileInput');
  const browseBtn = document.getElementById('btnBrowseProductImg');
  const uploadBox = document.getElementById('imgUploadPreviewBox');
  const imgEl = document.getElementById('formImgPreview');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleProductImageFile(file);
      }
    });
  }

  if (browseBtn) {
    browseBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  if (uploadBox) {
    uploadBox.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        if (fileInput) fileInput.click();
      }
    });

    // Drag and drop handlers
    uploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = '#2563eb';
      uploadBox.style.background = '#eff6ff';
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.style.borderColor = '#cbd5e1';
      uploadBox.style.background = '#f8fafc';
    });

    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = '#cbd5e1';
      uploadBox.style.background = '#f8fafc';

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          handleProductImageFile(file);
        } else {
          alert('Vui lòng chọn hoặc kéo thả tệp định dạng hình ảnh (.jpg, .png, .webp, .svg)!');
        }
      }
    });
  }

  // Handle broken image error dynamically
  if (imgEl) {
    imgEl.addEventListener('error', () => {
      const warningBadge = document.getElementById('imgFileWarningBadge');
      const placeholderEl = document.getElementById('imgUploadPlaceholder');
      imgEl.style.display = 'none';
      if (placeholderEl) placeholderEl.style.display = 'block';

      if (warningBadge) {
        warningBadge.style.display = 'block';
        warningBadge.innerHTML = '⚠️ <strong>Không thể hiển thị ảnh từ liên kết này.</strong><br>Nếu dùng ảnh trên máy, vui lòng nhấn nút <strong>"Chọn tệp ảnh từ máy tính"</strong> bên trên để chọn file trực tiếp!';
      }
    });
  }
}

function handleProductImageFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('formProductImage');
    if (urlInput) urlInput.value = dataUrl;

    updateFormImagePreview(dataUrl, file.name, file.size);
  };
  reader.readAsDataURL(file);
}

function openAddProductForm() {
  switchAdminScreen('products');
  resetProductForm();
  document.getElementById('formProductName')?.focus();
}

function editProductFromAdmin(productId) {
  switchAdminScreen('products');

  const product = adminProductsData.find(p => p.id == productId);
  if (!product) return;

  document.getElementById('formProductId').value = product.id;
  document.getElementById('formProductName').value = product.name;
  document.getElementById('formProductCategory').value = product.category || 'trang-tri';
  document.getElementById('formProductPrice').value = product.price;
  document.getElementById('formProductImage').value = product.image;
  document.getElementById('formProductStatus').value = product.status || 'Active';
  const showOnHomeCb = document.getElementById('formProductShowOnHome');
  if (showOnHomeCb) showOnHomeCb.checked = product.showOnHome !== false;
  document.getElementById('formProductDesc').value = product.desc || '';

  const formTitle = document.getElementById('productFormTitle');
  const modeBadge = document.getElementById('formModeBadge');

  if (formTitle) formTitle.textContent = `Edit Product #${product.id}`;
  if (modeBadge) {
    modeBadge.textContent = 'Chỉnh sửa';
    modeBadge.className = 'badge-status status-warning';
  }

  updateFormImagePreview(product.image);
}

function deleteProductFromAdmin(productId) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng?')) return;

  adminProductsData = adminProductsData.filter(p => p.id != productId);
  saveProductsData();
  renderAllAdminScreens();
}

function resetProductForm() {
  const form = document.getElementById('adminProductForm');
  if (form) form.reset();

  document.getElementById('formProductId').value = '';
  const fileInput = document.getElementById('formProductFileInput');
  if (fileInput) fileInput.value = '';
  const showOnHomeCb = document.getElementById('formProductShowOnHome');
  if (showOnHomeCb) showOnHomeCb.checked = true;

  const formTitle = document.getElementById('productFormTitle');
  const modeBadge = document.getElementById('formModeBadge');

  if (formTitle) formTitle.textContent = 'Product Form';
  if (modeBadge) {
    modeBadge.textContent = 'Thêm mới';
    modeBadge.className = 'badge-status status-info';
  }

  updateFormImagePreview('');
}

function updateFormImagePreview(url, fileName = '', fileSize = 0) {
  const imgEl = document.getElementById('formImgPreview');
  const placeholderEl = document.getElementById('imgUploadPlaceholder');
  const infoBadge = document.getElementById('imgFileInfoBadge');
  const warningBadge = document.getElementById('imgFileWarningBadge');

  // Clear previous badges
  if (infoBadge) { infoBadge.style.display = 'none'; infoBadge.innerHTML = ''; }
  if (warningBadge) { warningBadge.style.display = 'none'; warningBadge.innerHTML = ''; }

  const trimmedUrl = (url || '').trim();

  // Detect local disk paths like C:\Users\... or D:\... or file:///
  const isLocalDiskPath = /^[a-zA-Z]:[\\\/]/.test(trimmedUrl) || trimmedUrl.startsWith('file:///');

  if (isLocalDiskPath) {
    if (imgEl) imgEl.style.display = 'none';
    if (placeholderEl) placeholderEl.style.display = 'block';

    if (warningBadge) {
      warningBadge.style.display = 'block';
      warningBadge.innerHTML = `⚠️ <strong>Đường dẫn ổ đĩa local (${trimmedUrl.substring(0, 35)}...):</strong><br>Trình duyệt web bảo mật nên không thể đọc trực tiếp đường dẫn file ổ C:/D:. Vui lòng nhấp nút <strong>"Chọn tệp ảnh từ máy tính"</strong> ở trên để duyệt ảnh!`;
    }
    return;
  }

  if (trimmedUrl !== '') {
    if (imgEl) {
      imgEl.src = trimmedUrl;
      imgEl.style.display = 'block';
    }
    if (placeholderEl) placeholderEl.style.display = 'none';

    if (fileName && infoBadge) {
      const sizeStr = fileSize ? ` (${(fileSize / 1024).toFixed(1)} KB)` : '';
      infoBadge.style.display = 'block';
      infoBadge.innerHTML = `📷 Tệp ảnh đã chọn: <strong>${fileName}</strong>${sizeStr}`;
    }
  } else {
    if (imgEl) imgEl.style.display = 'none';
    if (placeholderEl) placeholderEl.style.display = 'block';
  }
}

// --------------------------------------------------------------------------
// 6. Global Search & Utilities
// --------------------------------------------------------------------------
function setupGlobalSearch() {
  const searchInput = document.getElementById('adminGlobalSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value;
    const prodSearch = document.getElementById('productSearchInput');
    if (prodSearch) {
      prodSearch.value = q;
      renderProductsManagementScreen();
    }
  });

  // Hotkey Ctrl+K for search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

function getCategoryName(catId) {
  const map = {
    'noi-that': 'Nội thất',
    'trang-tri': 'Trang trí (Decor)',
    'nha-bep': 'Nhà bếp',
    'den': 'Đèn trang trí',
    'van-phong': 'Văn phòng',
    'luu-tru': 'Lưu trữ'
  };
  return map[catId] || catId || 'Đồ thủ công';
}

function formatPriceVND(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
