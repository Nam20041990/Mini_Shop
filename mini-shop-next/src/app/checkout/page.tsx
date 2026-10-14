'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { useToast } from '@/context/ToastContext';
import { createOrderInSupabase } from '@/utils/supabase/orders';

export interface OrderFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
}

/**
 * Tiêu chuẩn xác thực dữ liệu đặt hàng của khách:
 * 1. Số điện thoại: Phải là số di động Việt Nam (03x, 05x, 07x, 08x, 09x hoặc +84), đúng 10 số, không chứa chữ cái, không lặp vô nghĩa.
 * 2. Địa chỉ: Tối thiểu 8 ký tự, có ít nhất 2 từ rõ ràng, không chỉ toàn số, không gõ linh tinh / gõ bừa.
 * 3. Tỉnh / Thành phố: Tối thiểu 3 ký tự, không chỉ gồm chữ số.
 * 4. Họ và tên: Tối thiểu 2 từ (họ + tên), từ 3 ký tự, không chứa chữ số.
 * 5. Email (tùy chọn): Nếu nhập thì phải đúng định dạng email.
 */
export function validateOrderForm(data: {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
}): { isValid: boolean; errors: OrderFormErrors } {
  const errors: OrderFormErrors = {};

  // 1. Kiểm tra Họ và tên
  const name = data.name.trim();
  if (!name) {
    errors.name = 'Vui lòng nhập họ và tên người nhận.';
  } else if (name.length < 3) {
    errors.name = 'Họ và tên quá ngắn (tối thiểu 3 ký tự).';
  } else if (/\d/.test(name)) {
    errors.name = 'Họ và tên không được chứa chữ số!';
  } else if (name.split(/\s+/).filter(Boolean).length < 2) {
    errors.name = 'Vui lòng nhập đầy đủ cả họ và tên (tối thiểu 2 từ, ví dụ: Nguyễn Văn A).';
  }

  // 2. Kiểm tra Số điện thoại
  const rawPhone = data.phone.trim();
  if (!rawPhone) {
    errors.phone = 'Vui lòng nhập số điện thoại người nhận.';
  } else if (/[a-zA-ZÀ-ỹ]/.test(rawPhone)) {
    errors.phone = 'Lỗi: Số điện thoại không được chứa chữ cái! Vui lòng chỉ nhập số.';
  } else {
    const cleanPhone = rawPhone.replace(/[\s.-]/g, '');
    const generalVnRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!generalVnRegex.test(cleanPhone)) {
      errors.phone = 'Số điện thoại không đúng chuẩn di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84).';
    } else {
      const normalizedDigits = cleanPhone.replace(/^\+84/, '0');
      const uniqueDigits = new Set(normalizedDigits.split(''));
      if (uniqueDigits.size <= 2) {
        errors.phone = 'Số điện thoại không hợp lệ (chứa dãy số lặp lại không có thật)!';
      }
    }
  }

  // 3. Kiểm tra Email (nếu khách nhập)
  if (data.email && data.email.trim()) {
    const email = data.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Địa chỉ email không đúng định dạng (ví dụ: name@example.com).';
    }
  }

  // 4. Kiểm tra Tỉnh / Thành phố
  const city = data.city.trim();
  if (!city) {
    errors.city = 'Vui lòng nhập Tỉnh / Thành phố nhận hàng.';
  } else if (city.length < 3) {
    errors.city = 'Tên Tỉnh / Thành phố quá ngắn (tối thiểu 3 ký tự, ví dụ: Hà Nội, TP.HCM).';
  } else if (/^\d+$/.test(city)) {
    errors.city = 'Tên Tỉnh / Thành phố không thể chỉ gồm chữ số.';
  }

  // 5. Kiểm tra Địa chỉ chi tiết (ngăn chặn gõ linh tinh / gõ bừa)
  const address = data.address.trim();
  const addressWords = address.split(/\s+/).filter(Boolean);
  const junkPatterns = [
    /^(linh\s*tinh|gõ\s*bừa|go\s*bua|không\s*có|ko\s*co|chưa\s*biết|asdf|qwerty|test|abc|xyz|nhà\s*tôi|o\s*day|ở\s*đây)/i,
    /(.)\1{4,}/, // ký tự lặp vô nghĩa như aaaaa, 11111, .....
  ];

  if (!address) {
    errors.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết.';
  } else if (address.length < 8) {
    errors.address = 'Địa chỉ quá ngắn (tối thiểu 8 ký tự, ví dụ: Số 123 Lê Lợi)!';
  } else if (/^\d+$/.test(address.replace(/[\s,.-]/g, ''))) {
    errors.address = 'Địa chỉ không hợp lệ (không thể chỉ gồm chữ số)!';
  } else if (addressWords.length < 2) {
    errors.address = 'Địa chỉ không rõ ràng (cần tối thiểu 2 từ, gồm số nhà, tên đường hoặc thôn xóm)!';
  } else if (junkPatterns.some((pattern) => pattern.test(address))) {
    errors.address = 'Địa chỉ chứa từ ngữ linh tinh hoặc không rõ ràng! Vui lòng nhập địa chỉ giao hàng thực tế.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

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

  const [formErrors, setFormErrors] = useState<OrderFormErrors>({});

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

    // Áp dụng tiêu chuẩn xác thực thông tin đặt hàng
    const validation = validateOrderForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      showToast(firstError || 'Thông tin đặt hàng chưa đúng tiêu chuẩn. Vui lòng kiểm tra lại!', 'danger');
      return;
    }

    setFormErrors({});
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      style={formErrors.name ? { borderColor: '#ef4444' } : undefined}
                      required
                    />
                    {formErrors.name && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        ⚠️ {formErrors.name}
                      </span>
                    )}
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
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      style={formErrors.phone ? { borderColor: '#ef4444' } : undefined}
                      required
                    />
                    {formErrors.phone && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        ⚠️ {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ Email (tùy chọn)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      style={formErrors.email ? { borderColor: '#ef4444' } : undefined}
                    />
                    {formErrors.email && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        ⚠️ {formErrors.email}
                      </span>
                    )}
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
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: undefined }));
                      }}
                      style={formErrors.city ? { borderColor: '#ef4444' } : undefined}
                      required
                    />
                    {formErrors.city && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        ⚠️ {formErrors.city}
                      </span>
                    )}
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
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      style={formErrors.address ? { borderColor: '#ef4444' } : undefined}
                      required
                    />
                    {formErrors.address && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        ⚠️ {formErrors.address}
                      </span>
                    )}
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
