'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_PRODUCTS } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

const CATEGORIES = [
  {
    id: 'all',
    name: 'Tất cả',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    id: 'noi-that',
    name: 'Nội thất',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path>
        <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path>
        <path d="M4 17v4"></path>
        <path d="M20 17v4"></path>
      </svg>
    ),
  },
  {
    id: 'trang-tri',
    name: 'Trang trí',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
  },
  {
    id: 'nha-bep',
    name: 'Nhà bếp',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2v20M6 2v20M12 2v20"></path>
      </svg>
    ),
  },
  {
    id: 'den',
    name: 'Đèn',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18h6M10 22h4M15 8a3 3 0 1 0-6 0c0 1.66.75 3.15 2 4.17V15a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-2.83A5.002 5.002 0 0 0 15 8z"></path>
      </svg>
    ),
  },
  {
    id: 'van-phong',
    name: 'Văn phòng',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
  },
  {
    id: 'luu-tru',
    name: 'Lưu trữ',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    ),
  },
  {
    id: 'khac',
    name: 'Khác',
    icon: (
      <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const displayedProducts = useMemo(() => {
    // Check localStorage products first if any was added/modified by admin
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mini_shop_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let list = parsed.filter((p) => p.showOnHome !== false && p.status !== 'Inactive');
            if (selectedCategory !== 'all') {
              list = list.filter((p) => p.category === selectedCategory);
            }
            return list;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    let list = INITIAL_PRODUCTS.filter((p) => p.showOnHome !== false && p.status !== 'Inactive');
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return list;
  }, [selectedCategory]);

  return (
    <>
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-card">
            <div className="hero-content">
              <h1 className="hero-title">
                Sống đẹp mỗi ngày<br />cùng Mini Shop
              </h1>
              <p className="hero-subtitle">Sản phẩm chất lượng cho tổ ấm của bạn.</p>
              <Link href="/products" className="btn btn-primary">
                Mua sắm ngay
              </Link>

              <div className="hero-features">
                {/* Feature 1: Fast Delivery */}
                <div className="feature-item">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <div className="feature-text">
                    <span className="feature-title">Giao hàng nhanh</span>
                    <span className="feature-desc">Toàn quốc</span>
                  </div>
                </div>

                {/* Feature 2: Warranty */}
                <div className="feature-item">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                  <div className="feature-text">
                    <span className="feature-title">Bảo hành chính hãng</span>
                    <span className="feature-desc">7 ngày đổi trả</span>
                  </div>
                </div>

                {/* Feature 3: Support */}
                <div className="feature-item">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                  <div className="feature-text">
                    <span className="feature-title">Hỗ trợ 24/7</span>
                    <span className="feature-desc">Tư vấn tận tâm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <img
                className="hero-img"
                src="/assets/images/banner/banner-trang-chu-mini-shop.webp"
                alt="Trang trí nội thất Mini Shop"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs Filter Bar */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-bar" id="categoriesBar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-btn ${cat.id === selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <Link href="/products" className="view-all-link">
              <span>Xem tất cả</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>

          <div className="product-grid" id="featuredProductGrid">
            {displayedProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  Thử chọn danh mục khác hoặc nhấn &quot;Xem tất cả&quot;.
                </p>
              </div>
            ) : (
              displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </section>
    </>
  );
}
