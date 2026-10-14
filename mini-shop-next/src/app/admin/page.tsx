'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { formatPrice, getCategoryName } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
} from '@/utils/supabase/products';
import {
  getOrdersFromSupabase,
  updateOrderStatusInSupabase,
  SupabaseOrderRow,
} from '@/utils/supabase/orders';

// Danh sách các hình ảnh có sẵn trong thư mục assets để admin chọn nhanh
export const AVAILABLE_ASSET_IMAGES = [
  { label: 'Sofa Bắc Âu 2 chỗ', path: '/assets/images/products/San_pham/sofa-phong-khach-original.webp' },
  { label: 'Bộ bàn ăn gỗ Sồi', path: '/assets/images/products/San_pham/bo-ban-an-go-original.webp' },
  { label: 'Đèn tre thủ công', path: '/assets/images/products/San_pham/den-tre-thu-cong-original.webp' },
  { label: 'Đèn lồng tre', path: '/assets/images/products/San_pham/den-long-tre-original.webp' },
  { label: 'Bình gốm trang trí', path: '/assets/images/products/San_pham/binh-gom-trang-tri-original.webp' },
  { label: 'Bộ bình gốm Minimal', path: '/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp' },
  { label: 'Chậu cây để bàn', path: '/assets/images/products/San_pham/chau-cay-de-ban-original.webp' },
  { label: 'Giỏ mây đan tự nhiên', path: '/assets/images/products/San_pham/gio-may-dan-original.webp' },
  { label: 'Kệ gỗ 3 tầng đa năng', path: '/assets/images/products/San_pham/ke-go-trang-tri-original.webp' },
  { label: 'Khay gỗ hoa văn', path: '/assets/images/products/San_pham/khay-go-hoa-van-original.webp' },
  { label: 'Khay gỗ trang trí', path: '/assets/images/products/San_pham/khay-go-trang-tri-original.webp' },
  { label: 'Tranh treo Macrame', path: '/assets/images/products/San_pham/tranh-treo-macrame-original.webp' },
  { label: 'Hộp sơn mài mỹ nghệ', path: '/assets/images/products/đồ mỹ nghệ/hop-son-mai.webp' },
  { label: 'Khay khảm trai cao cấp', path: '/assets/images/products/đồ mỹ nghệ/khay-kham-trai.webp' },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Chặn khu quản trị: Nếu chưa đăng nhập hoặc không phải admin, đưa về trang đăng nhập
  useEffect(() => {
    if (!loading) {
      if (!user) {
        showToast('Vui lòng đăng nhập tài khoản quản trị viên để tiếp tục!', 'warning');
        router.replace('/login');
      } else if (user.role !== 'admin') {
        showToast('Tài khoản của bạn không có quyền quản trị viên! Đang chuyển về trang đăng nhập.', 'danger');
        router.replace('/login');
      }
    }
  }, [user, loading, router, showToast]);

  const [activeScreen, setActiveScreen] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'settings'
  >('dashboard');

  // Supabase Live Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Supabase Live Orders State
  const [supabaseOrders, setSupabaseOrders] = useState<SupabaseOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tải danh sách sản phẩm trực tiếp từ kho Supabase
  const fetchProductsFromSupabase = async () => {
    setLoadingProducts(true);
    try {
      const data = await getProductsFromSupabase(true); // Lấy toàn bộ bao gồm cả Inactive
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products from Supabase:', e);
      showToast('Không thể tải sản phẩm từ Supabase!', 'danger');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Tải danh sách đơn hàng trực tiếp từ kho Supabase
  const fetchOrdersFromSupabase = async () => {
    setLoadingOrders(true);
    try {
      const data = await getOrdersFromSupabase();
      setSupabaseOrders(data);
    } catch (e) {
      console.error('Error fetching orders from Supabase:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProductsFromSupabase();
    fetchOrdersFromSupabase();
  }, []);

  useEffect(() => {
    if (activeScreen === 'orders' || activeScreen === 'dashboard') {
      fetchOrdersFromSupabase();
    }
    if (activeScreen === 'products' || activeScreen === 'dashboard') {
      fetchProductsFromSupabase();
    }
  }, [activeScreen]);

  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formProductId, setFormProductId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('noi-that');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formImage, setFormImage] = useState(AVAILABLE_ASSET_IMAGES[0].path);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formShowOnHome, setFormShowOnHome] = useState(true);
  const [formDesc, setFormDesc] = useState('');

  const [imageFileName, setImageFileName] = useState(AVAILABLE_ASSET_IMAGES[0].label);
  const [imageFileWarning, setImageFileWarning] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete product with confirmation dialog
  const handleDeleteProduct = async (id: number) => {
    const prod = products.find((p) => p.id === id);
    const prodName = prod ? `"${prod.name}" (ID #${prod.id})` : `#${id}`;

    const confirmed = window.confirm(
      `⚠️ XÁC NHẬN XÓA SẢN PHẨM\n\nBạn có chắc chắn muốn xóa vĩnh viễn sản phẩm ${prodName} khỏi cơ sở dữ liệu Supabase?\n\nSản phẩm sẽ bị gỡ bỏ khỏi cửa hàng và không thể hoàn tác!`
    );

    if (!confirmed) return;

    setIsSavingProduct(true);
    try {
      await deleteProductInSupabase(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Đã xóa vĩnh viễn sản phẩm ${prodName} khỏi Supabase!`, 'success');
      if (formProductId === id) {
        resetForm();
      }
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm trên Supabase:', err);
      showToast('Không thể xóa sản phẩm: ' + (err?.message || 'Có lỗi xảy ra'), 'danger');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormMode('create');
    setFormProductId(null);
    setFormName('');
    setFormCategory('noi-that');
    setFormPrice('');
    setFormImage(AVAILABLE_ASSET_IMAGES[0].path);
    setFormStatus('Active');
    setFormShowOnHome(true);
    setFormDesc('');
    setImageFileName(AVAILABLE_ASSET_IMAGES[0].label);
    setImageFileWarning('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save product directly to Supabase
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '' || !formImage.trim()) {
      showToast('Vui lòng điền đầy đủ tên, giá và chọn ảnh sản phẩm!', 'warning');
      return;
    }

    setIsSavingProduct(true);
    try {
      if (formMode === 'create') {
        const created = await createProductInSupabase({
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          image: formImage.trim(),
          desc: formDesc.trim() || 'Sản phẩm cao cấp tại Mini Shop',
          status: formStatus,
          showOnHome: formShowOnHome,
        });

        setProducts((prev) => [created, ...prev]);
        showToast(`🎉 Đã thêm sản phẩm "${created.name}" lên Supabase thành công!`, 'success');
        resetForm();
      } else if (formProductId !== null) {
        const updated = await updateProductInSupabase(formProductId, {
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          image: formImage.trim(),
          desc: formDesc.trim(),
          status: formStatus,
          showOnHome: formShowOnHome,
        });

        setProducts((prev) =>
          prev.map((p) => (p.id === formProductId ? updated : p))
        );
        showToast(`Đã cập nhật sản phẩm "${updated.name}" trên Supabase thành công!`, 'success');
        resetForm();
      }
    } catch (err: any) {
      console.error('Lỗi lưu sản phẩm lên Supabase:', err);
      showToast('Lỗi lưu sản phẩm: ' + (err?.message || 'Có lỗi xảy ra'), 'danger');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Handle changing order status directly in Supabase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusInSupabase(orderId, newStatus);
      setSupabaseOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      const labels: Record<string, string> = {
        Processing: 'Mới / Đang xử lý',
        Shipping: 'Đang giao hàng',
        Delivered: 'Đã giao hàng',
        Cancelled: 'Đã hủy',
      };
      showToast(`Đã chuyển đơn #${orderId} sang "${labels[newStatus] || newStatus}"!`, 'success');
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái đơn:', err);
      showToast('Không thể cập nhật trạng thái đơn: ' + (err?.message || 'Có lỗi xảy ra'), 'danger');
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          backgroundColor: '#f8fafc',
          color: '#4b5563',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>
          {loading ? 'Đang kiểm tra quyền quản trị...' : 'Đang chuyển hướng về trang đăng nhập...'}
        </p>
      </div>
    );
  }

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
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => fetchProductsFromSupabase()}
                          disabled={loadingProducts}
                          title="Làm mới danh sách từ kho Supabase"
                        >
                          🔄 {loadingProducts ? 'Đang tải...' : 'Làm mới'}
                        </button>
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
                          {loadingProducts ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                                ⏳ Đang tải dữ liệu sản phẩm trực tiếp từ kho Supabase...
                              </td>
                            </tr>
                          ) : filteredProducts.length === 0 ? (
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

                      {/* Image Selection: Pre-existing Assets Picker */}
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Hình ảnh sản phẩm *</span>
                          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                            📸 Ảnh có sẵn trong Assets
                          </span>
                        </label>

                        {/* Dropdown to select an asset */}
                        <select
                          className="form-control form-select"
                          value={AVAILABLE_ASSET_IMAGES.some((a) => a.path === formImage) ? formImage : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              const found = AVAILABLE_ASSET_IMAGES.find((a) => a.path === val);
                              setFormImage(val);
                              setImageFileName(found ? found.label : '');
                            }
                          }}
                          style={{ marginBottom: '0.5rem', fontWeight: 500 }}
                        >
                          <optgroup label="-- Chọn ảnh có sẵn từ thư mục assets --">
                            {AVAILABLE_ASSET_IMAGES.map((img) => (
                              <option key={img.path} value={img.path}>
                                {img.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="-- Tùy chọn khác --">
                            <option value="custom">Nhập đường dẫn tùy chỉnh hoặc tải lên...</option>
                          </optgroup>
                        </select>

                        {/* Visual Assets Thumbnail Gallery */}
                        <div style={{ marginBottom: '0.6rem' }}>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                            Bấm chọn nhanh ảnh mẫu ({AVAILABLE_ASSET_IMAGES.length} ảnh):
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '6px',
                              maxHeight: '170px',
                              overflowY: 'auto',
                              padding: '6px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              background: '#f8fafc',
                            }}
                          >
                            {AVAILABLE_ASSET_IMAGES.map((img) => {
                              const isSelected = formImage === img.path;
                              return (
                                <div
                                  key={img.path}
                                  onClick={() => {
                                    setFormImage(img.path);
                                    setImageFileName(img.label);
                                  }}
                                  title={`${img.label}\n${img.path}`}
                                  style={{
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '3px',
                                    background: isSelected ? '#eff6ff' : '#fff',
                                    position: 'relative',
                                    textAlign: 'center',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none',
                                  }}
                                >
                                  <img
                                    src={img.path}
                                    alt={img.label}
                                    style={{
                                      width: '100%',
                                      height: '42px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: '0.62rem',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      color: isSelected ? '#1d4ed8' : '#64748b',
                                      fontWeight: isSelected ? 700 : 500,
                                      marginTop: '2px',
                                    }}
                                  >
                                    {img.label}
                                  </div>
                                  {isSelected && (
                                    <span
                                      style={{
                                        position: 'absolute',
                                        top: '3px',
                                        right: '3px',
                                        background: '#2563eb',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        width: '15px',
                                        height: '15px',
                                        fontSize: '9px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Preview Box */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 12px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <img
                            src={formImage}
                            alt="Xem trước"
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                              ✓ {imageFileName || 'Ảnh đã chọn'}
                            </div>
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: '#64748b',
                                wordBreak: 'break-all',
                                marginTop: '2px',
                              }}
                            >
                              {formImage}
                            </div>
                          </div>
                        </div>

                        {/* Custom path / URL input fallback */}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Hoặc dán URL/đường dẫn ảnh assets tại đây..."
                          value={formImage}
                          onChange={(e) => {
                            setFormImage(e.target.value);
                            const found = AVAILABLE_ASSET_IMAGES.find((a) => a.path === e.target.value);
                            setImageFileName(found ? found.label : 'Ảnh tùy chỉnh');
                          }}
                          style={{ fontSize: '0.8rem' }}
                        />
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
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                          disabled={isSavingProduct}
                          style={{ opacity: isSavingProduct ? 0.7 : 1 }}
                        >
                          <span>
                            {isSavingProduct
                              ? '⏳ Đang lưu vào Supabase...'
                              : formMode === 'create'
                              ? '💾 Thêm sản phẩm vào Supabase'
                              : '💾 Cập nhật lên Supabase'}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => resetForm()}
                          disabled={isSavingProduct}
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
                    <h2 className="panel-title">
                      Quản lý Đơn hàng ({supabaseOrders.length})
                    </h2>
                    <span className="panel-sub">Dữ liệu đơn hàng đồng bộ trực tiếp từ Supabase</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={async () => {
                      setLoadingOrders(true);
                      const data = await getOrdersFromSupabase();
                      setSupabaseOrders(data);
                      setLoadingOrders(false);
                      showToast('Đã làm mới danh sách đơn hàng!', 'info');
                    }}
                  >
                    🔄 Làm mới
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Địa chỉ</th>
                        <th>Các món</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái (Supabase)</th>
                        <th>Thao tác đổi trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            ⏳ Đang tải đơn hàng thật từ kho Supabase...
                          </td>
                        </tr>
                      ) : supabaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            Chưa có đơn hàng nào trong hệ thống Supabase.
                          </td>
                        </tr>
                      ) : (
                        supabaseOrders.map((ord) => {
                          const itemsList = Array.isArray(ord.items) ? ord.items : [];
                          return (
                            <tr key={ord.id}>
                              <td><strong>#{ord.id}</strong></td>
                              <td>
                                <strong>{ord.customer_name}</strong>
                                <br />
                                <small style={{ color: '#64748b' }}>{ord.customer_phone}</small>
                              </td>
                              <td style={{ maxWidth: '180px' }}>
                                <small>{ord.shipping_address}</small>
                              </td>
                              <td style={{ maxWidth: '220px' }}>
                                {itemsList.length > 0 ? (
                                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem' }}>
                                    {itemsList.map((it: any, idx: number) => (
                                      <li key={idx}>
                                        {it.name || 'Sản phẩm'} <strong style={{ color: 'var(--primary-color)' }}>x{it.quantity}</strong>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>--</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: '#16a34a' }}>
                                  {formatPrice(ord.total)}
                                </strong>
                              </td>
                              <td>
                                <span className="cat-pill" style={{ fontSize: '0.78rem' }}>
                                  {ord.payment_method || 'COD'}
                                </span>
                              </td>
                              <td>
                                {/* Interactive status selector directly modifying Supabase */}
                                <select
                                  value={ord.status || 'Processing'}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  style={{
                                    padding: '5px 8px',
                                    fontSize: '0.82rem',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: '1px solid #cbd5e1',
                                    background:
                                      ord.status === 'Delivered' || ord.status === 'Completed'
                                        ? '#f0fdf4'
                                        : ord.status === 'Shipping'
                                        ? '#eff6ff'
                                        : ord.status === 'Cancelled'
                                        ? '#fef2f2'
                                        : '#fefce8',
                                    color:
                                      ord.status === 'Delivered' || ord.status === 'Completed'
                                        ? '#166534'
                                        : ord.status === 'Shipping'
                                        ? '#1d4ed8'
                                        : ord.status === 'Cancelled'
                                        ? '#991b1b'
                                        : '#854d0e',
                                  }}
                                  title="Chọn trạng thái để cập nhật vào Supabase"
                                >
                                  <option value="Processing">🟡 Mới (Chờ xử lý)</option>
                                  <option value="Shipping">🚚 Đang giao hàng</option>
                                  <option value="Delivered">✅ Đã giao hàng</option>
                                  <option value="Cancelled">❌ Đã hủy</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  {(ord.status === 'Processing' || !ord.status) && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline"
                                      style={{
                                        fontSize: '0.74rem',
                                        padding: '4px 8px',
                                        borderColor: '#3b82f6',
                                        color: '#1d4ed8',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 600,
                                      }}
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'Shipping')}
                                      title="Chuyển trạng thái sang Đang giao"
                                    >
                                      🚚 Giao hàng
                                    </button>
                                  )}
                                  {ord.status === 'Shipping' && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      style={{
                                        fontSize: '0.74rem',
                                        padding: '4px 8px',
                                        background: '#16a34a',
                                        borderColor: '#16a34a',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 600,
                                      }}
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                                      title="Chuyển trạng thái sang Đã giao"
                                    >
                                      ✅ Đã giao
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn-table-action"
                                    onClick={() =>
                                      showToast(
                                        `Đơn #${ord.id}: ${ord.customer_name} (${formatPrice(ord.total)}) - Trạng thái: ${ord.status}`,
                                        'info'
                                      )
                                    }
                                    title="Xem chi tiết đơn"
                                  >
                                    👁️ Chi tiết
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
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
