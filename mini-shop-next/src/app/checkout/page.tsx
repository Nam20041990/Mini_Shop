'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { useToast } from '@/context/ToastContext';
import { createOrderInSupabase } from '@/utils/supabase/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, totalCount } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    total: number;
    itemsCount: number;
  } | null>(null);

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'warning');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }

    setIsSubmitting(true);
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const orderItems = cart.map((item) => {
      const prod = item.product;
      const price = prod?.price || 0;
      return {
        id: item.id,
        product_id: prod?.id || item.id,
        name: prod?.name || 'Sản phẩm',
        price: price,
        quantity: item.quantity,
        image: prod?.image || '',
        total: price * item.quantity,
      };
    });

    try {
      // 1. Ghi đơn hàng trực tiếp vào kho Supabase (bảng orders và order_items)
      await createOrderInSupabase({
        id: orderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress: `${formData.address}, ${formData.city}`,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        notes: formData.notes,
        subtotal: subtotal,
        shippingFee: shippingFee,
        discountAmount: 0,
        total: grandTotal,
        items: orderItems,
      });

      // 2. Ghi thêm vào localStorage để tương thích dữ liệu cục bộ
      const newOrder = {
        id: orderId,
        customer: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}`,
        items: cart,
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        status: 'Processing',
        date: new Date().toLocaleDateString('vi-VN'),
      };
      const stored = localStorage.getItem('mini_shop_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(newOrder);
      localStorage.setItem('mini_shop_orders', JSON.stringify(orders));

      // 3. Hoàn tất đơn hàng
      clearCart();
      setSubmittedOrder({
        id: orderId,
        total: grandTotal,
        itemsCount: totalCount,
      });
      showToast('Đặt hàng thành công! Đơn hàng đã được lưu vào hệ thống.', 'success');
    } catch (err: any) {
      console.error('Lỗi khi lưu đơn hàng:', err);
      showToast(
        'Không thể lưu đơn hàng vào hệ thống: ' + (err?.message || 'Vui lòng thử lại!'),
        'danger'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <ul className="breadcrumb">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li>
              <Link href="/cart">Giỏ hàng</Link>
            </li>
            <li className="breadcrumb-separator">&gt;</li>
            <li className="breadcrumb-current">Thanh toán & Đặt hàng</li>
          </ul>
        </nav>

        {/* Page Header */}
        <div className="checkout-page-header">
          <h1 className="checkout-page-title">Thanh toán đơn hàng</h1>
          <p className="checkout-page-subtitle">
            Vui lòng điền thông tin người nhận bên dưới để hoàn tất đơn hàng.
          </p>
        </div>

        {cart.length === 0 && !submittedOrder ? (
          <div className="cart-empty-box">
            <h2 className="cart-empty-title">Giỏ hàng trống</h2>
            <p className="cart-empty-desc">
              Bạn chưa có sản phẩm nào để thanh toán. Hãy chọn món đồ ưng ý trước nhé!
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-layout-grid">
            {/* Left Column: Shipping Info & Payment Method */}
            <div className="checkout-form-section">
              {/* Card 1: Customer Info */}
              <div className="checkout-card">
                <h2 className="checkout-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>1. Thông tin giao hàng</span>
                </h2>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">
                      Họ và tên người nhận <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Số điện thoại <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Ví dụ: 0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ Email (tùy chọn)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Tỉnh / Thành phố <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hà Nội / TP. Hồ Chí Minh..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Địa chỉ chi tiết (Số nhà, tên đường...) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Số 123 Đường Lê Lợi, Phường 1"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Ghi chú đơn hàng (nếu có)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Nhập ghi chú thêm cho người giao hàng..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Payment Methods */}
              <div className="checkout-card">
                <h2 className="checkout-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <span>2. Phương thức thanh toán</span>
                </h2>

                <div className="payment-methods-list">
                  <label className="payment-method-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    />
                    <div className="payment-method-body">
                      <div className="payment-method-header">
                        <div className="payment-title-group">
                          <span className="payment-method-title">Thanh toán khi nhận hàng (COD)</span>
                          <span className="payment-badge-tag">Phổ biến</span>
                        </div>
                      </div>
                      <p className="payment-method-desc">
                        Bạn chỉ cần thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi kiểm tra và nhận hàng.
                      </p>
                    </div>
                  </label>

                  <label className="payment-method-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank' })}
                    />
                    <div className="payment-method-body">
                      <div className="payment-method-header">
                        <div className="payment-title-group">
                          <span className="payment-method-title">Chuyển khoản ngân hàng (QR-Code)</span>
                        </div>
                      </div>
                      <p className="payment-method-desc">
                        Chuyển khoản qua ứng dụng ngân hàng bằng quét mã VietQR tự động xác nhận sau 1 phút.
                      </p>
                    </div>
                  </label>

                  <label className="payment-method-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'momo' })}
                    />
                    <div className="payment-method-body">
                      <div className="payment-method-header">
                        <div className="payment-title-group">
                          <span className="payment-method-title">Ví điện tử MoMo / ZaloPay</span>
                        </div>
                      </div>
                      <p className="payment-method-desc">
                        Thanh toán tiện lợi qua ứng dụng ví MoMo hoặc ZaloPay trên điện thoại.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div className="summary-card">
              <h2 className="summary-title">Đơn hàng của bạn</h2>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingRight: '4px',
                }}
              >
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
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.name}
                        </p>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          SL: {item.quantity} × {formatPrice(product.price)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-row">
                <span>Tạm tính:</span>
                <span className="summary-val">{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span className="summary-val">
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Tổng thanh toán:</span>
                <span className="total-price">{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-checkout"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                      <path d="M12 2a10 10 0 0 1 10 10"></path>
                    </svg>
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  'Xác nhận đặt hàng'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Order Success Modal */}
        {submittedOrder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Đặt hàng thành công!
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Cảm ơn bạn đã tin tưởng mua sắm tại Mini Shop. Chúng tôi đã nhận được thông tin đơn hàng và sẽ liên hệ sớm nhất.
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
                  <strong style={{ color: '#0f172a' }}>{submittedOrder.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Tổng tiền:</span>
                  <strong style={{ color: '#16a34a' }}>{formatPrice(submittedOrder.total)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Phương thức:</span>
                  <strong style={{ color: '#0f172a' }}>{formData.paymentMethod.toUpperCase()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Link href="/" className="btn btn-outline" style={{ flex: 1 }}>
                  Về trang chủ
                </Link>
                <Link href="/products" className="btn btn-primary" style={{ flex: 1 }}>
                  Tiếp tục xem hàng
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
