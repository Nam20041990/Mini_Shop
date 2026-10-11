'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatPrice, getCategoryName, INITIAL_PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/product/ProductCard';

interface Props {
  initialProduct?: Product;
  productId: number;
}

function generateProductDetails(product: Product) {
  if (product.details && product.details.material && product.details.dimensions) {
    return product.details;
  }

  const cat = product.category || 'trang-tri';
  const specsMap: Record<string, { material: string; color: string; dimensions: string; weight: string; madeIn: string }> = {
    'noi-that': {
      material: 'Gỗ tự nhiên & Vải nỉ đệm cao cấp',
      color: 'Xám ghi / Kem / Gỗ tự nhiên',
      dimensions: '150cm x 75cm x 80cm',
      weight: '18.5 kg',
      madeIn: 'Việt Nam',
    },
    'trang-tri': {
      material: 'Gốm sứ Bát Tràng / Thuỷ tinh mỹ nghệ',
      color: 'Trắng kem / Nâu mộc / Xanh pastel',
      dimensions: '25cm x 15cm x 30cm',
      weight: '1.2 kg',
      madeIn: 'Việt Nam',
    },
    'nha-bep': {
      material: 'Gỗ sồi Nga & Inox 304 không gỉ',
      color: 'Vàng gỗ mộc / Bạc ánh kim',
      dimensions: '35cm x 25cm x 12cm',
      weight: '0.95 kg',
      madeIn: 'Việt Nam',
    },
    'den': {
      material: 'Tre tự nhiên đan tay & Khung sơn tĩnh điện',
      color: 'Vàng tre mộc / Đen nhám',
      dimensions: 'Đường kính 32cm, Cao 40cm',
      weight: '1.6 kg',
      madeIn: 'Việt Nam',
    },
    'luu-tru': {
      material: 'Mây tre đan tự nhiên & Khung thép',
      color: 'Màu cói tự nhiên / Nâu cánh gián',
      dimensions: '40cm x 30cm x 25cm',
      weight: '1.1 kg',
      madeIn: 'Việt Nam',
    },
  };

  return specsMap[cat] || specsMap['trang-tri'];
}

export default function ProductDetailClient({ initialProduct, productId }: Props) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(initialProduct);
  const [selectedImg, setSelectedImg] = useState<string>(initialProduct?.image || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    setIsClientLoaded(true);
    try {
      const stored = localStorage.getItem('mini_shop_products');
      if (stored) {
        const list: Product[] = JSON.parse(stored);
        const found = list.find((p) => p.id === productId);
        if (found) {
          setCurrentProduct(found);
          setSelectedImg(found.image);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage for product detail:', e);
    }

    if (initialProduct) {
      setCurrentProduct(initialProduct);
      setSelectedImg(initialProduct.image);
    }
  }, [productId, initialProduct]);

  const product = currentProduct;

  // Gallery state
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    return [product.image];
  }, [product]);

  // Keep selected image in sync if product changes
  useEffect(() => {
    if (product) {
      if (!selectedImg || !galleryImages.includes(selectedImg)) {
        setSelectedImg(product.image);
      }
    }
  }, [product, galleryImages, selectedImg]);

  if (!product) {
    if (!isClientLoaded) {
      return (
        <div className="product-detail-page">
          <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="product-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Không tìm thấy sản phẩm
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Sản phẩm có mã #{productId} không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <Link href="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const activeWish = isWishlisted(product.id);
  const oldPrice = product.oldPrice || Math.round(product.price * 1.25);
  const discountPercent =
    product.discount
      ? parseInt(product.discount.replace(/[^0-9]/g, ''), 10) || 20
      : Math.round(((oldPrice - product.price) / oldPrice) * 100);

  const specs = generateProductDetails(product);

  // Related products
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <ul className="breadcrumb" id="productBreadcrumb">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li>
              <Link href={`/products?category=${product.category}`}>
                {getCategoryName(product.category)}
              </Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li className="breadcrumb-current">{product.name}</li>
          </ul>
        </nav>

        {/* Main Product Detail Layout (3-Column Grid matching Reference Design) */}
        <div className="product-detail-layout">
          {/* Column 1: Image Gallery (Left Thumbnails + Main View) */}
          <div className="product-gallery-section">
            {galleryImages.length > 1 && (
              <div className="thumbnail-list">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${selectedImg === img ? 'active' : ''}`}
                    onClick={() => setSelectedImg(img)}
                    aria-label={`Ảnh ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="main-image-container">
              <img src={selectedImg || product.image} alt={product.name} />
            </div>
          </div>

          {/* Column 2: Middle Product Info & Actions */}
          <div className="product-info-section">
            <div className="badge-group">
              <span className={`stock-status-badge ${product.status === 'Inactive' ? 'out-stock' : 'in-stock'}`}>
                <span className={`stock-dot ${product.status === 'Inactive' ? 'out' : ''}`}></span>
                {product.status === 'Inactive' ? 'Tạm hết hàng' : 'Còn hàng'}
              </span>
              <span className="category-tag-badge">{getCategoryName(product.category)}</span>
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            <div className="rating-row">
              <div className="stars-list">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="star-icon filled" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="reviews-count">({product.reviewsCount || 48} đánh giá)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">{formatPrice(product.price)}</span>
              {oldPrice > product.price && (
                <span className="detail-old-price">{formatPrice(oldPrice)}</span>
              )}
              {discountPercent > 0 && (
                <span className="detail-discount-badge">-{discountPercent}%</span>
              )}
            </div>

            <p className="product-detail-desc">{product.desc}</p>

            {/* Quantity Selector */}
            <div className="quantity-wrapper">
              <span className="quantity-label">Số lượng:</span>
              <div className="quantity-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  max="99"
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons-group">
              <button
                type="button"
                className="btn btn-add-cart"
                onClick={() => addToCart(product.id, quantity)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                className={`btn btn-detail-wishlist ${activeWish ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={activeWish ? 'var(--danger-color)' : 'none'}
                  stroke={activeWish ? 'var(--danger-color)' : 'currentColor'}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{activeWish ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-policies-bar">
              <div className="trust-item">
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <div className="trust-text">
                  <span className="trust-title">Giao hàng miễn phí</span>
                  <span className="trust-desc">Đơn từ 500.000 đ</span>
                </div>
              </div>

              <div className="trust-item">
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <div className="trust-text">
                  <span className="trust-title">Đổi trả 7 ngày</span>
                  <span className="trust-desc">Cam kết hoàn tiền nhanh</span>
                </div>
              </div>

              <div className="trust-item">
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
                <div className="trust-text">
                  <span className="trust-title">Thanh toán an toàn</span>
                  <span className="trust-desc">Bảo mật thông tin 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Right Sidebar Cards (Detail Specs & Delivery Cards) */}
          <div className="product-sidebar-section">
            {/* Card 1: DETAIL / THÔNG SỐ */}
            <div className="sidebar-info-card">
              <h3 className="sidebar-card-title">THÔNG SỐ SẢN PHẨM</h3>
              <ul className="specs-list">
                <li>
                  <span className="spec-label">Chất liệu</span>
                  <span className="spec-value">{specs.material}</span>
                </li>
                <li>
                  <span className="spec-label">Màu sắc</span>
                  <span className="spec-value">{specs.color}</span>
                </li>
                <li>
                  <span className="spec-label">Kích thước</span>
                  <span className="spec-value">{specs.dimensions}</span>
                </li>
                <li>
                  <span className="spec-label">Trọng lượng</span>
                  <span className="spec-value">{specs.weight}</span>
                </li>
                <li>
                  <span className="spec-label">Xuất xứ</span>
                  <span className="spec-value">{specs.madeIn}</span>
                </li>
              </ul>
            </div>

            {/* Card 2: DELIVERY */}
            <div className="sidebar-info-card">
              <h3 className="sidebar-card-title">GIAO HÀNG & VẬN CHUYỂN</h3>
              <ul className="delivery-list">
                <li>
                  <span className="bullet">•</span>
                  <div>
                    <strong>Thời gian giao hàng:</strong> 2–5 ngày làm việc
                  </div>
                </li>
                <li>
                  <span className="bullet">•</span>
                  <div>
                    <strong>Giao hỏa tốc:</strong> 1–2 ngày làm việc
                  </div>
                </li>
                <li>
                  <span className="bullet">•</span>
                  <div>
                    <strong>Phí vận chuyển:</strong> 30,000 VND (Miễn phí từ 500k)
                  </div>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => alert('Chính sách giao hàng: Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên trên toàn quốc.')}
                className="delivery-more-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                Xem chính sách vận chuyển
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="products-section" style={{ marginTop: '4rem' }}>
            <div className="section-header">
              <h2 className="section-title">Sản phẩm cùng danh mục</h2>
              <Link href={`/products?category=${product.category}`} className="view-all-link">
                <span>Xem thêm</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
