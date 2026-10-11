'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { INITIAL_PRODUCTS, formatPrice, getCategoryName } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [activeScreen, setActiveScreen] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'settings'
  >('dashboard');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formProductId, setFormProductId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('noi-that');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formImage, setFormImage] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formShowOnHome, setFormShowOnHome] = useState(true);
  const [formDesc, setFormDesc] = useState('');

  const [imageFileName, setImageFileName] = useState('');
  const [imageFileWarning, setImageFileWarning] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mini_shop_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync products to localStorage
  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('mini_shop_products', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp định dạng hình ảnh!', 'danger');
      return;
    }

    setImageFileName(file.name);
    setImageFileWarning('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormImage(result);
      showToast(`Đã tải ảnh "${file.name}" thành công!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng kéo thả tệp hình ảnh!', 'danger');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormImage(result);
      showToast(`Đã chọn ảnh "${file.name}"!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Edit product
  const handleEditProduct = (p: Product) => {
    setFormMode('edit');
    setFormProductId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormImage(p.image);
    setFormStatus(p.status === 'Inactive' ? 'Inactive' : 'Active');
    setFormShowOnHome(p.showOnHome !== false);
    setFormDesc(p.desc);
    setImageFileName('');
    setActiveScreen('products');
  };

  // Handle Delete product
  const handleDeleteProduct = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const updated = products.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
      showToast('Đã xóa sản phẩm thành công!', 'info');
      if (formProductId === id) {
        resetForm();
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormMode('create');
    setFormProductId(null);
    setFormName('');
    setFormCategory('noi-that');
    setFormPrice('');
    setFormImage('');
    setFormStatus('Active');
    setFormShowOnHome(true);
    setFormDesc('');
    setImageFileName('');
    setImageFileWarning('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save product
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '' || !formImage.trim()) {
      showToast('Vui lòng điền đầy đủ tên, giá và ảnh sản phẩm!', 'warning');
      return;
    }

    if (formMode === 'create') {
      const newId = Date.now();
      const newProd: Product = {
        id: newId,
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        image: formImage.trim(),
        desc: formDesc.trim() || 'Sản phẩm cao cấp tại Mini Shop',
        badge: 'Mới',
        badgeType: 'new',
        status: formStatus,
        showOnHome: formShowOnHome,
      };
      const updated = [newProd, ...products];
      saveProductsToStorage(updated);
      showToast('Thêm sản phẩm mới thành công!', 'success');
      resetForm();
    } else {
      const updated = products.map((p) => {
        if (p.id === formProductId) {
          return {
            ...p,
            name: formName.trim(),
            category: formCategory,
            price: Number(formPrice),
            image: formImage.trim(),
            status: formStatus,
            showOnHome: formShowOnHome,
            desc: formDesc.trim(),
          };
        }
        return p;
      });
      saveProductsToStorage(updated);
      showToast('Cập nhật sản phẩm thành công!', 'success');
      resetForm();
    }
  };

  return (
    <div className="admin-app-body" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="admin-app-layout">
        {/* Left Sidebar */}
        <aside className="admin-sidebar" id="adminSidebar">
          <div className="sidebar-brand">
            <Link href="/" className="sidebar-logo">
              <div className="logo-icon-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
                </svg>
              </div>
              <div className="brand-text">
                <strong>Mini Shop</strong>
                <small>Khu Quản Trị</small>
              </div>
            </Link>
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('dashboard')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeScreen === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('products')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  <span>Quản lý Sản phẩm</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeScreen === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('orders')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Đơn hàng</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeScreen === 'categories' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('categories')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Danh mục</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeScreen === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('users')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Người dùng</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="sidebar-quick-summary">
            <span className="summary-title">Thống kê nhanh</span>
            <div className="summary-item">
              <span>📦 Sản phẩm</span>
              <strong>{products.length}</strong>
            </div>
            <div className="summary-item">
              <span>🏷️ Danh mục</span>
              <strong>6</strong>
            </div>
            <div className="summary-item">
              <span>🛒 Đơn hàng</span>
              <strong>128</strong>
            </div>
          </div>

          <div className="sidebar-footer">
            <Link
              href="/"
              className="btn btn-outline btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              <span>🏠 Xem Cửa Hàng</span>
            </Link>
            <button
              type="button"
              className="btn-sidebar-logout"
              onClick={() => {
                logout();
                showToast('Đã đăng xuất tài khoản quản trị.', 'info');
                router.push('/');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Right Main Wrapper */}
        <div className="admin-main-wrapper">
          {/* Header */}
          <header className="admin-top-header">
            <div className="header-left">
              <h1 className="screen-title">
                {activeScreen === 'dashboard' && 'Bảng điều khiển (Dashboard)'}
                {activeScreen === 'products' && 'Quản lý Sản phẩm'}
                {activeScreen === 'orders' && 'Quản lý Đơn hàng'}
                {activeScreen === 'categories' && 'Danh mục Sản phẩm'}
                {activeScreen === 'users' && 'Danh sách Khách hàng & Quản trị'}
                {activeScreen === 'settings' && 'Cài đặt hệ thống'}
              </h1>
            </div>

            <div className="header-right">
              <div className="admin-search-box">
                <svg className="search-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  {user?.name || 'Administrator'}
                </span>
                <span className="badge-status status-success">Admin</span>
              </div>
            </div>
          </header>

          {/* Body Content */}
          <div className="admin-main-content">
            {/* SCREEN 1: DASHBOARD */}
            {activeScreen === 'dashboard' && (
              <div>
                {/* 4 Metric Cards matching admin.html and screenshot */}
                <div className="dash-metrics-grid">
                  <div className="dash-metric-card">
                    <div className="metric-text">
                      <span className="metric-label">Total products</span>
                      <strong className="metric-value" id="metricTotalProducts">
                        {products.length}
                      </strong>
                      <span className="metric-sub">All products in store</span>
                    </div>
                    <div className="metric-icon-box icon-blue">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="dash-metric-card">
                    <div className="metric-text">
                      <span className="metric-label">Categories</span>
                      <strong className="metric-value" id="metricCategories">6</strong>
                      <span className="metric-sub">Product categories</span>
                    </div>
                    <div className="metric-icon-box icon-green">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="dash-metric-card">
                    <div className="metric-text">
                      <span className="metric-label">Visible products</span>
                      <strong className="metric-value" id="metricVisibleProducts">
                        {products.filter((p) => p.status !== 'Inactive').length}
                      </strong>
                      <span className="metric-sub">Currently visible</span>
                    </div>
                    <div className="metric-icon-box icon-purple">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="7" r="3"></circle>
                      </svg>
                    </div>
                  </div>

                  <div className="dash-metric-card">
                    <div className="metric-text">
                      <span className="metric-label">Low stock</span>
                      <strong className="metric-value warning" id="metricLowStock">3</strong>
                      <span className="metric-sub">Products low on stock</span>
                    </div>
                    <div className="metric-icon-box icon-orange">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Main Row: Sales Chart & Recent Products Table */}
                <div className="dash-main-grid">
                  {/* Left: Sales Overview Chart Box */}
                  <div className="panel-card chart-panel">
                    <div className="panel-header">
                      <div>
                        <h2 className="panel-title">Sales overview</h2>
                        <span className="panel-sub">Doanh thu & đơn hàng 7 ngày gần đây</span>
                      </div>
                      <select className="form-select-sm" defaultValue="7">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                      </select>
                    </div>
                    <div className="chart-content">
                      {/* SVG Line Chart Canvas */}
                      <div className="svg-chart-container">
                        <svg viewBox="0 0 600 200" className="sales-chart-svg">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                          {/* Area Fill */}
                          <polygon
                            points="20,130 115,85 210,105 305,50 400,95 495,80 580,35 580,180 20,180"
                            fill="url(#chartGrad)"
                          />
                          {/* Smooth Line */}
                          <path
                            d="M 20 130 C 60 100, 80 80, 115 85 C 150 90, 180 110, 210 105 C 250 100, 270 45, 305 50 C 340 55, 370 100, 400 95 C 430 90, 470 70, 495 80 C 530 90, 550 45, 580 35"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* Data Points */}
                          <circle cx="20" cy="130" r="4" fill="#2563eb" />
                          <circle cx="115" cy="85" r="4" fill="#2563eb" />
                          <circle cx="210" cy="105" r="4" fill="#2563eb" />
                          <circle cx="305" cy="50" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                          <circle cx="400" cy="95" r="4" fill="#2563eb" />
                          <circle cx="495" cy="80" r="4" fill="#2563eb" />
                          <circle cx="580" cy="35" r="4" fill="#2563eb" />

                          {/* Tooltip SVG popup */}
                          <g transform="translate(260, 10)">
                            <rect
                              x="0"
                              y="0"
                              width="90"
                              height="32"
                              rx="6"
                              fill="#ffffff"
                              stroke="#cbd5e1"
                              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
                            />
                            <text x="45" y="14" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                              Oct 10
                            </text>
                            <text x="45" y="26" textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="700">
                              7.540.000 đ
                            </text>
                          </g>
                        </svg>
                        <div className="chart-dates-row">
                          <span>04/10</span>
                          <span>05/10</span>
                          <span>06/10</span>
                          <span>07/10</span>
                          <span>08/10</span>
                          <span>09/10</span>
                          <span>10/10</span>
                        </div>
                      </div>

                      {/* Chart Summary Stats Footer */}
                      <div className="chart-footer-stats">
                        <div className="stat-box">
                          <span className="st-lbl">Total sales</span>
                          <strong className="st-val">42.580.000 đ</strong>
                          <span className="st-badge pos">↑ 18.6%</span>
                        </div>
                        <div className="stat-box">
                          <span className="st-lbl">Orders</span>
                          <strong className="st-val">128</strong>
                          <span className="st-badge pos">↑ 12.4%</span>
                        </div>
                        <div className="stat-box">
                          <span className="st-lbl">Average order</span>
                          <strong className="st-val">332.656 đ</strong>
                          <span className="st-badge pos">↑ 5.7%</span>
                        </div>
                        <div className="stat-box">
                          <span className="st-lbl">Conversion rate</span>
                          <strong className="st-val">2.35%</strong>
                          <span className="st-badge pos">↑ 8.1%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Recent Products Box */}
                  <div className="panel-card recent-products-panel">
                    <div className="panel-header">
                      <h2 className="panel-title">Recent products</h2>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          resetForm();
                          setActiveScreen('products');
                        }}
                      >
                        + Add product
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="dash-table">
                        <thead>
                          <tr>
                            <th>PRODUCT</th>
                            <th>PRICE</th>
                            <th>STOCK</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 5).map((p, idx) => (
                            <tr key={p.id}>
                              <td>
                                <div className="prod-flex-cell">
                                  <img src={p.image} alt={p.name} className="table-prod-img" />
                                  <div>
                                    <strong className="prod-name-title">{p.name}</strong>
                                    <span className="prod-sub-cat">{getCategoryName(p.category)}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <strong className="price-text">{formatPrice(p.price)}</strong>
                              </td>
                              <td>
                                <span>{idx === 0 ? 25 : 18}</span>
                              </td>
                              <td>
                                <span className={`badge-status ${p.status === 'Inactive' ? 'status-danger' : 'status-success'}`}>
                                  {p.status === 'Inactive' ? 'Inactive' : 'Visible'}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-table-action btn-action-edit"
                                  onClick={() => handleEditProduct(p)}
                                >
                                  ✏️ Sửa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Orders Overview Donut & Top Categories Bar */}
                <div className="dash-bottom-grid">
                  {/* Left Donut: Orders Overview */}
                  <div className="panel-card donut-panel">
                    <div className="panel-header">
                      <h2 className="panel-title">Orders overview</h2>
                      <select className="form-select-sm" defaultValue="7">
                        <option value="7">Last 7 days</option>
                      </select>
                    </div>
                    <div className="donut-content-row">
                      <div className="donut-chart-box">
                        <svg viewBox="0 0 100 100" className="donut-svg">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                          {/* Completed (Green) 45% */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="16"
                            strokeDasharray="107 238"
                            strokeDashoffset="0"
                          />
                          {/* Processing (Blue) 30% */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="16"
                            strokeDasharray="71 238"
                            strokeDashoffset="-107"
                          />
                          {/* Delivering (Orange) 20% */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="16"
                            strokeDasharray="48 238"
                            strokeDashoffset="-178"
                          />
                          {/* Cancelled (Red) 5% */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="16"
                            strokeDasharray="12 238"
                            strokeDashoffset="-226"
                          />
                        </svg>
                      </div>
                      <div className="donut-legend">
                        <div className="legend-item">
                          <span className="leg-dot dot-green"></span>
                          <span>Completed</span>
                          <strong>45 (35.2%)</strong>
                        </div>
                        <div className="legend-item">
                          <span className="leg-dot dot-blue"></span>
                          <span>Processing</span>
                          <strong>38 (29.7%)</strong>
                        </div>
                        <div className="legend-item">
                          <span className="leg-dot dot-orange"></span>
                          <span>Delivering</span>
                          <strong>25 (19.5%)</strong>
                        </div>
                        <div className="legend-item">
                          <span className="leg-dot dot-red"></span>
                          <span>Cancelled</span>
                          <strong>5 (3.9%)</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Bar: Top Categories */}
                  <div className="panel-card categories-progress-panel">
                    <div className="panel-header">
                      <h2 className="panel-title">Top categories</h2>
                      <select className="form-select-sm" defaultValue="sales">
                        <option value="sales">By sales</option>
                      </select>
                    </div>
                    <div className="progress-list">
                      <div className="prog-item">
                        <div className="prog-info">
                          <span>Nội thất</span>
                          <strong>18.450.000 đ</strong>
                        </div>
                        <div className="prog-bar-bg">
                          <div className="prog-bar-fill" style={{ width: '85%', background: '#2563eb' }}></div>
                        </div>
                      </div>

                      <div className="prog-item">
                        <div className="prog-info">
                          <span>Trang trí (Decor)</span>
                          <strong>12.300.000 đ</strong>
                        </div>
                        <div className="prog-bar-bg">
                          <div className="prog-bar-fill" style={{ width: '65%', background: '#0284c7' }}></div>
                        </div>
                      </div>

                      <div className="prog-item">
                        <div className="prog-info">
                          <span>Đèn trang trí</span>
                          <strong>8.500.000 đ</strong>
                        </div>
                        <div className="prog-bar-bg">
                          <div className="prog-bar-fill" style={{ width: '48%', background: '#16a34a' }}></div>
                        </div>
                      </div>

                      <div className="prog-item">
                        <div className="prog-info">
                          <span>Nhà bếp</span>
                          <strong>6.200.000 đ</strong>
                        </div>
                        <div className="prog-bar-bg">
                          <div className="prog-bar-fill" style={{ width: '35%', background: '#ea580c' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: PRODUCTS MANAGEMENT */}
            {activeScreen === 'products' && (
              <div className="mgmt-grid-layout">
                {/* Left: Products Table */}
                <div className="mgmt-main-col">
                  <div className="panel-card">
                    <div className="panel-header">
                      <div>
                        <h2 className="panel-title">Danh sách Sản phẩm ({filteredProducts.length})</h2>
                        <span className="panel-sub">
                          Quản lý giá, danh mục, liên kết xem ngoài shop và trạng thái hiển thị
                        </span>
                      </div>
                      <div className="panel-header-actions">
                        <select
                          className="form-select-sm"
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        >
                          <option value="all">Tất cả danh mục</option>
                          <option value="noi-that">Nội thất</option>
                          <option value="trang-tri">Trang trí</option>
                          <option value="nha-bep">Nhà bếp</option>
                          <option value="den">Đèn</option>
                          <option value="van-phong">Văn phòng</option>
                          <option value="luu-tru">Lưu trữ</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => resetForm()}
                        >
                          + Thêm mới
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá niêm yết</th>
                            <th>Trưng bày</th>
                            <th>Trạng thái</th>
                            <th>Thao tác & Liên kết</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem' }}>
                                Không tìm thấy sản phẩm nào phù hợp.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <img src={p.image} alt={p.name} className="table-prod-img" />
                                </td>
                                <td>
                                  <strong className="prod-name-title">{p.name}</strong>
                                  <span className="prod-sub-cat">ID: #{p.id}</span>
                                </td>
                                <td>
                                  <span className="cat-pill">{getCategoryName(p.category)}</span>
                                </td>
                                <td>
                                  <span className="price-text">{formatPrice(p.price)}</span>
                                </td>
                                <td>
                                  {p.showOnHome !== false ? (
                                    <span className="badge-status status-info">🏠 Trang chủ</span>
                                  ) : (
                                    <span className="badge-status status-muted">Ẩn Home</span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`badge-status ${
                                      p.status === 'Inactive' ? 'status-danger' : 'status-success'
                                    }`}
                                  >
                                    {p.status || 'Active'}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-btn-group">
                                    {/* Direct View Link as requested by user */}
                                    <Link
                                      href={`/products/${p.id}`}
                                      target="_blank"
                                      className="btn-table-action btn-action-view"
                                      title="Mở liên kết chi tiết sản phẩm"
                                    >
                                      🔗 Xem SP
                                    </Link>
                                    <button
                                      type="button"
                                      className="btn-table-action btn-action-edit"
                                      onClick={() => handleEditProduct(p)}
                                      title="Chỉnh sửa sản phẩm"
                                    >
                                      ✏️ Sửa
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-table-action btn-action-delete"
                                      onClick={() => handleDeleteProduct(p.id)}
                                      title="Xóa sản phẩm"
                                    >
                                      🗑️ Xóa
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right: Add/Edit Product Form with File Picker & Dropzone */}
                <div className="mgmt-side-col">
                  <div className="panel-card sticky-panel">
                    <div className="panel-header border-bottom">
                      <h2 className="panel-title">
                        {formMode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}
                      </h2>
                      <span
                        className={`badge-status ${
                          formMode === 'create' ? 'status-info' : 'status-warning'
                        }`}
                      >
                        {formMode === 'create' ? 'Mới' : `Sửa #${formProductId}`}
                      </span>
                    </div>

                    <form onSubmit={handleFormSubmit} className="admin-form-body">
                      <div className="form-group">
                        <label className="form-label">Tên sản phẩm *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập tên sản phẩm..."
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Danh mục *</label>
                        <select
                          className="form-control form-select"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                        >
                          <option value="noi-that">Nội thất</option>
                          <option value="trang-tri">Trang trí (Decor)</option>
                          <option value="nha-bep">Nhà bếp</option>
                          <option value="den">Đèn trang trí</option>
                          <option value="van-phong">Văn phòng</option>
                          <option value="luu-tru">Lưu trữ</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Giá bán (VND) *</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Ví dụ: 350000"
                          value={formPrice}
                          onChange={(e) =>
                            setFormPrice(e.target.value ? Number(e.target.value) : '')
                          }
                          required
                        />
                      </div>

                      {/* Image Selection with Native File Input & URL option */}
                      <div className="form-group">
                        <label className="form-label">Hình ảnh sản phẩm *</label>

                        {/* Hidden Native File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />

                        <div className="image-input-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            📁 Chọn tệp ảnh từ máy tính...
                          </button>
                        </div>

                        {/* Input URL fallback */}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Hoặc dán URL đường dẫn ảnh tại đây..."
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}
                        />

                        {/* Drag and Drop Box & Preview */}
                        <div
                          className="img-upload-box"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            minHeight: '130px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                          }}
                        >
                          {formImage ? (
                            <div style={{ textAlign: 'center' }}>
                              <img
                                src={formImage}
                                alt="Xem trước"
                                style={{
                                  maxHeight: '110px',
                                  maxWidth: '100%',
                                  borderRadius: '8px',
                                  objectFit: 'contain',
                                  margin: '0 auto 6px',
                                  border: '1px solid #cbd5e1',
                                }}
                              />
                              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'block' }}>
                                ✓ {imageFileName || 'Đã có ảnh sản phẩm'} (Nhấp để đổi)
                              </span>
                            </div>
                          ) : (
                            <div>
                              <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ color: '#94a3b8', margin: '0 auto 6px', display: 'block' }}
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block' }}>
                                Bấm để chọn ảnh từ máy tính
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                Hoặc kéo & thả file ảnh trực tiếp vào đây
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Trạng thái bán</label>
                        <select
                          className="form-control form-select"
                          value={formStatus}
                          onChange={(e) =>
                            setFormStatus(e.target.value as 'Active' | 'Inactive')
                          }
                        >
                          <option value="Active">Active (Đang hiển thị)</option>
                          <option value="Inactive">Inactive (Ẩn sản phẩm)</option>
                        </select>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: 0,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formShowOnHome}
                            onChange={(e) => setFormShowOnHome(e.target.checked)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: '#2563eb',
                              cursor: 'pointer',
                            }}
                          />
                          <span>🏠 Trưng bày ở Trang chủ (Homepage)</span>
                        </label>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: '#64748b',
                            display: 'block',
                            marginTop: '4px',
                            paddingLeft: '28px',
                          }}
                        >
                          Đánh dấu để xuất hiện ở khu vực nổi bật ngoài trang chủ.
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mô tả tóm tắt</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Mô tả chất liệu, kiểu dáng, điểm nổi bật..."
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                        />
                      </div>

                      <div className="form-actions-row">
                        <button type="submit" className="btn btn-primary btn-block">
                          <span>{formMode === 'create' ? 'Lưu sản phẩm' : 'Cập nhật'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => resetForm()}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: ORDERS */}
            {activeScreen === 'orders' && (
              <div className="panel-card">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Quản lý Đơn hàng (128)</h2>
                    <span className="panel-sub">Theo dõi các đơn mua của khách hàng</span>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Địa chỉ</th>
                        <th>Tổng tiền</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>#ORD-849201</strong></td>
                        <td>Nguyễn Văn An<br/><small style={{ color: '#64748b' }}>0912 345 678</small></td>
                        <td>Hà Nội</td>
                        <td><strong style={{ color: '#16a34a' }}>799.000 đ</strong></td>
                        <td>COD</td>
                        <td><span className="badge-status status-info">Đang xử lý</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => showToast('Đã xác nhận đơn hàng!', 'success')}
                          >
                            Xác nhận
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>#ORD-739210</strong></td>
                        <td>Trần Thị Hoa<br/><small style={{ color: '#64748b' }}>0988 123 456</small></td>
                        <td>TP. Hồ Chí Minh</td>
                        <td><strong style={{ color: '#16a34a' }}>1.250.000 đ</strong></td>
                        <td>VietQR</td>
                        <td><span className="badge-status status-success">Đã hoàn thành</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => showToast('Xem chi tiết đơn hàng', 'info')}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCREEN 4: CATEGORIES */}
            {activeScreen === 'categories' && (
              <div className="panel-card">
                <div className="panel-header">
                  <h2 className="panel-title">Danh mục Sản phẩm</h2>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên danh mục</th>
                        <th>Mã định danh (slug)</th>
                        <th>Số lượng sản phẩm</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Nội thất</strong></td>
                        <td>noi-that</td>
                        <td>{products.filter((p) => p.category === 'noi-that').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                      <tr>
                        <td><strong>Trang trí (Decor)</strong></td>
                        <td>trang-tri</td>
                        <td>{products.filter((p) => p.category === 'trang-tri').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                      <tr>
                        <td><strong>Nhà bếp</strong></td>
                        <td>nha-bep</td>
                        <td>{products.filter((p) => p.category === 'nha-bep').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                      <tr>
                        <td><strong>Đèn</strong></td>
                        <td>den</td>
                        <td>{products.filter((p) => p.category === 'den').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                      <tr>
                        <td><strong>Văn phòng</strong></td>
                        <td>van-phong</td>
                        <td>{products.filter((p) => p.category === 'van-phong').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                      <tr>
                        <td><strong>Lưu trữ</strong></td>
                        <td>luu-tru</td>
                        <td>{products.filter((p) => p.category === 'luu-tru').length} sản phẩm</td>
                        <td><span className="badge-status status-success">Hoạt động</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCREEN 5: USERS */}
            {activeScreen === 'users' && (
              <div className="panel-card">
                <div className="panel-header">
                  <h2 className="panel-title">Tài khoản & Phân quyền</h2>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Administrator</strong></td>
                        <td>admin@minishop.com</td>
                        <td><span className="badge-status status-info">Quản trị viên (Admin)</span></td>
                        <td><span className="badge-status status-success">Active</span></td>
                      </tr>
                      <tr>
                        <td><strong>Khách hàng Mẫu</strong></td>
                        <td>khachhang@gmail.com</td>
                        <td><span className="badge-status status-muted">Khách hàng</span></td>
                        <td><span className="badge-status status-success">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
