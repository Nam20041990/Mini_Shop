'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Call all hooks first; return null for admin after hooks
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const pages = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Danh mục', href: '/products', hasDropdown: true },
    { label: 'Sản phẩm', href: '/products' },
    { label: 'Hàng mới về', href: '/products?sort=new' },
    { label: 'Khuyến mãi', href: '/products?sale=true' },
    { label: 'Blog', href: '#' },
    { label: 'Liên hệ', href: '#' },
  ];

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <div className="logo-icon-box">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
            </svg>
          </div>
          <span className="logo-text">Mini Shop</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="nav-links">
            {pages.map((page, idx) => {
              const isActive = pathname === page.href;
              if (page.hasDropdown) {
                return (
                  <li key={idx} className="has-dropdown">
                    <Link href={page.href} className={isActive ? 'active' : ''}>
                      <span>{page.label}</span>
                      <svg className="nav-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </Link>
                    <ul className="dropdown-menu">
                      <li><Link href="/products">Tất cả sản phẩm</Link></li>
                      <li><Link href="/products?cat=noi-that">Nội thất</Link></li>
                      <li><Link href="/products?cat=trang-tri">Trang trí (Decor)</Link></li>
                      <li><Link href="/products?cat=nha-bep">Nhà bếp</Link></li>
                      <li><Link href="/products?cat=den">Đèn</Link></li>
                      <li><Link href="/products?cat=luu-tru">Lưu trữ</Link></li>
                    </ul>
                  </li>
                );
              }
              return (
                <li key={idx}>
                  <Link href={page.href} className={isActive ? 'active' : ''}>
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Search Bar and Action Buttons */}
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div className="auth-buttons">
            <Link href="/wishlist" className={`wishlist-btn-header ${pathname === '/wishlist' ? 'active' : ''}`} title="Danh sách yêu thích">
              <div className="wishlist-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className={`wishlist-badge ${wishlistCount > 0 ? 'has-items' : ''}`} id="headerWishlistBadge">{wishlistCount}</span>
              </div>
              <span className="wishlist-btn-text">Yêu thích</span>
            </Link>

            <Link href="/cart" className={`cart-btn-header ${pathname === '/cart' ? 'active' : ''}`} title="Giỏ hàng">
              <div className="cart-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className={`cart-badge ${cartCount > 0 ? 'has-items' : ''}`} id="headerCartBadge">{cartCount}</span>
              </div>
              <span className="cart-btn-text">Giỏ hàng</span>
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className={`btn btn-blue btn-admin-header ${pathname === '/admin' ? 'active' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Khu quản trị</span>
                  </Link>
                )}
                <div className="user-menu-wrapper" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="user-menu-btn"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <img src={user.avatar} className="user-avatar-img" alt={user.name} />
                    <span className="user-name-text">{user.name}</span>
                    <svg className="dropdown-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>

                  <div className={`user-dropdown-card ${isUserDropdownOpen ? 'active' : ''}`}>
                    <div className="user-dropdown-header">
                      <div className="user-info-row">
                        <img src={user.avatar} className="user-avatar-lg" alt={user.name} />
                        <div>
                          <strong className="user-display-name">{user.name}</strong>
                          <span className={`user-role-tag ${user.role}`}>{isAdmin ? '🛡️ Admin' : '👤 Khách'}</span>
                          <span className="user-email-text">{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    {isAdmin && (
                      <Link href="/admin" className="user-dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>Khu quản trị Admin</span>
                      </Link>
                    )}
                    <Link href="/products" className="user-dropdown-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      <span>Sản phẩm cửa hàng</span>
                    </Link>
                    <button type="button" className="user-dropdown-item logout-btn" onClick={() => { logout(); setIsUserDropdownOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={`auth-link ${pathname === '/login' ? 'active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>Đăng nhập</span>
                </Link>
                <Link href="/register" className={`auth-link ${pathname === '/register' ? 'active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                  <span>Đăng ký</span>
                </Link>
                <Link href="/admin" className={`btn btn-blue btn-admin-header ${pathname === '/admin' ? 'active' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>Admin</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-toggle"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-links">
          {pages.map((page, idx) => (
            <li key={idx}>
              <Link href={page.href} onClick={() => setIsMobileMenuOpen(false)}>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSearch} className="mobile-search" style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="auth-buttons" style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/wishlist" className="btn btn-outline" style={{ flex: '1 1 48%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>Yêu thích ({wishlistCount})</span>
          </Link>
          <Link href="/cart" className="btn btn-primary" style={{ flex: '1 1 48%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Giỏ hàng ({cartCount})</span>
          </Link>
          {!user ? (
            <>
              <Link href="/login" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Đăng nhập</Link>
              <Link href="/register" className="btn btn-blue" style={{ flex: 1, textAlign: 'center' }}>Đăng ký</Link>
            </>
          ) : (
            <button type="button" onClick={() => logout()} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', color: 'var(--danger-color)' }}>Đăng xuất</button>
          )}
        </div>
      </div>
    </header>
  );
}
