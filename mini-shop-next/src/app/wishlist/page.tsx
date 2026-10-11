'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { INITIAL_PRODUCTS } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist, totalCount } = useWishlist();

  // Find product details for wishlisted IDs
  const wishlistedProducts = useMemo(() => {
    let allProducts = INITIAL_PRODUCTS;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mini_shop_products');
        if (stored) {
          allProducts = JSON.parse(stored);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return wishlist
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is typeof allProducts[0] => Boolean(p));
  }, [wishlist]);

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <ul className="breadcrumb">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li>
              <Link href="/products">Sản phẩm</Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li className="breadcrumb-current">Danh sách yêu thích</li>
          </ul>
        </nav>

        {/* Page Header */}
        <div className="wishlist-page-header">
          <h1 className="wishlist-page-title">
            <span>Sản phẩm yêu thích</span>
            <span className="wishlist-title-count">({totalCount} sản phẩm)</span>
          </h1>
          <Link href="/products" className="continue-shopping-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="wishlist-empty-box">
            <div className="wishlist-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Danh sách yêu thích đang trống</h2>
            <p className="wishlist-empty-desc">
              Bạn chưa lưu sản phẩm nào. Hãy bấm vào biểu tượng trái tim ở mỗi sản phẩm để lưu lại xem sau nhé!
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              <span>Khám phá sản phẩm</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid-wrapper">
            <div className="wishlist-header-bar">
              <span>Món đồ đã lưu ({wishlistedProducts.length})</span>
              <button type="button" className="btn-clear-wishlist" onClick={clearWishlist}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Xóa tất cả</span>
              </button>
            </div>

            <div className="product-grid">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
