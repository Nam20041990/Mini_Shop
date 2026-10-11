'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice, getCategoryName } from '@/data/products';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalCount, subtotal } = useCart();

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="cart-page">
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
            <li className="breadcrumb-current">Giỏ hàng</li>
          </ul>
        </nav>

        {/* Cart Page Header */}
        <div className="cart-page-header">
          <h1 className="cart-page-title">
            <span>Giỏ hàng của bạn</span>
            <span className="cart-title-count">({totalCount} sản phẩm)</span>
          </h1>
          <Link href="/products" className="continue-shopping-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <div className="cart-empty-box">
            <div className="cart-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 className="cart-empty-title">Giỏ hàng của bạn đang trống</h2>
            <p className="cart-empty-desc">
              Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay các sản phẩm độc đáo của Mini Shop nhé!
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
          /* Main Cart Grid */
          <div className="cart-layout-grid">
            {/* Cart Items List */}
            <div className="cart-items-wrapper">
              <div className="cart-items-header-bar">
                <span>Danh sách món đồ ({totalCount})</span>
                <button type="button" className="btn-clear-cart" onClick={clearCart}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Xóa tất cả</span>
                </button>
              </div>

              <div className="cart-items-list-body">
                {cart.map((item) => {
                  const product = item.product || {
                    id: item.id,
                    name: 'Sản phẩm',
                    category: 'other',
                    price: 0,
                    desc: '',
                    image: '/assets/images/banner/banner-trang-chu-mini-shop.webp',
                  };
                  return (
                    <div key={item.id} className="cart-item-card">
                      <Link href={`/products/${item.id}`} className="cart-item-thumb">
                        <img src={product.image} alt={product.name} />
                      </Link>

                      <div className="cart-item-info">
                        <div className="cart-item-cat">{getCategoryName(product.category)}</div>
                        <h3 className="cart-item-title">
                          <Link href={`/products/${item.id}`}>{product.name}</Link>
                        </h3>
                        <div className="cart-item-unit-price">{formatPrice(product.price)}</div>
                      </div>

                      <div className="quantity-controls compact cart-item-qty">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="qty-input"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value) || 1)
                          }
                          min="1"
                          max="99"
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span className="subtotal-label">Thành tiền:</span>
                        <span className="subtotal-val">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>


                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                      title="Xóa món này"
                      aria-label="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="summary-card">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>

              <div className="summary-row">
                <span>Tạm tính ({totalCount} món):</span>
                <span className="summary-val">{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span className="summary-val">
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>

              {subtotal < 500000 ? (
                <div className="free-shipping-notice">
                  <span>💡 Mua thêm {formatPrice(500000 - subtotal)} để được MIỄN PHÍ ship!</span>
                </div>
              ) : (
                <div className="free-shipping-badge">
                  🎉 Bạn được Miễn phí vận chuyển toàn quốc!
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatPrice(grandTotal)}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary btn-checkout">
                Tiến hành thanh toán
              </Link>

              <div className="summary-benefits">
                <div className="benefit-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Bảo hành chính hãng 100%</span>
                </div>
                <div className="benefit-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Đổi trả thuận tiện trong 7 ngày</span>
                </div>
                <div className="benefit-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Thanh toán an toàn bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
