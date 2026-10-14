/* Checkout & Order Processing Logic (js/checkout.js) */

function initCheckoutPage() {
  // 1. Render Header & Footer
  renderHeader('cart');
  renderFooter();

  // 2. Render Order Summary & Form
  renderCheckoutSummary();

  // 3. Form Submit Handler
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleOrderSubmit);
  }
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const grandTotalEl = document.getElementById('checkoutGrandTotal');

  if (!summaryContainer) return;

  const cart = typeof getCart === 'function' ? getCart() : [];

  // Redirect if cart is empty
  if (cart.length === 0) {
    const mainSection = document.querySelector('.checkout-page');
    if (mainSection) {
      mainSection.innerHTML = `
        <div class="container" style="padding: 4rem 1.5rem; text-align: center;">
          <div class="cart-empty-box">
            <div class="cart-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px; height:40px;">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 class="cart-empty-title">Giỏ hàng của bạn đang trống</h2>
            <p class="cart-empty-desc">Không có sản phẩm nào để tiến hành thanh toán. Vui lòng chọn sản phẩm vào giỏ hàng trước nhé!</p>
            <a href="products.html" class="btn btn-primary btn-lg">Khám phá sản phẩm</a>
          </div>
        </div>
      `;
    }
    return;
  }

  let subtotal = 0;

  const itemsHtml = cart.map(item => {
    const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
    if (!product) return '';
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    const name = product.nameEn || product.name;

    return `
      <div class="checkout-item-row">
        <div class="checkout-item-left">
          <div class="checkout-item-thumb">
            <img src="${product.image}" alt="${name}">
            <span class="checkout-item-qty-badge">${item.quantity}</span>
          </div>
          <div class="checkout-item-meta">
            <h4 class="checkout-item-name">${name}</h4>
            <span class="checkout-item-unit">${formatPrice(product.price)} / sản phẩm</span>
          </div>
        </div>
        <div class="checkout-item-total">
          ${formatPrice(itemTotal)}
        </div>
      </div>
    `;
  }).join('');

  summaryContainer.innerHTML = itemsHtml;

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.innerHTML = shippingFee === 0 ? '<strong style="color: var(--primary-color);">Miễn phí</strong>' : formatPrice(shippingFee);
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);
}

// Supabase Configuration
const SUPABASE_URL = 'https://zaalwzrtahvzlvlfitqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VLebJXvySVZMFfXSZCzniQ_ClML7RlB';

function getSupabaseClient() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return null;
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  const fullname = document.getElementById('customerName')?.value.trim();
  const phone = document.getElementById('customerPhone')?.value.trim();
  const email = document.getElementById('customerEmail')?.value.trim();
  const address = document.getElementById('customerAddress')?.value.trim();
  const city = document.getElementById('customerCity')?.value.trim();
  const notes = document.getElementById('customerNotes')?.value.trim();
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod';

  // 1. Kiểm tra Họ và tên
  if (!fullname) {
    alert('Vui lòng nhập họ và tên người nhận.');
    document.getElementById('customerName')?.focus();
    return;
  }
  if (fullname.length < 3) {
    alert('Họ và tên quá ngắn (tối thiểu 3 ký tự).');
    document.getElementById('customerName')?.focus();
    return;
  }
  if (/\d/.test(fullname)) {
    alert('Họ và tên không được chứa chữ số!');
    document.getElementById('customerName')?.focus();
    return;
  }
  if (fullname.split(/\s+/).filter(Boolean).length < 2) {
    alert('Vui lòng nhập đầy đủ cả họ và tên (tối thiểu 2 từ, ví dụ: Nguyễn Văn A).');
    document.getElementById('customerName')?.focus();
    return;
  }

  // 2. Kiểm tra Số điện thoại (chặn nhập chữ, chặn số linh tinh)
  if (!phone) {
    alert('Vui lòng nhập số điện thoại người nhận.');
    document.getElementById('customerPhone')?.focus();
    return;
  }
  if (/[a-zA-ZÀ-ỹ]/.test(phone)) {
    alert('Lỗi: Số điện thoại không được chứa chữ cái! Vui lòng chỉ nhập số.');
    document.getElementById('customerPhone')?.focus();
    return;
  }
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  const generalVnRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!generalVnRegex.test(cleanPhone)) {
    alert('Số điện thoại không đúng chuẩn di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84).');
    document.getElementById('customerPhone')?.focus();
    return;
  }
  const normalizedDigits = cleanPhone.replace(/^\+84/, '0');
  const uniqueDigits = new Set(normalizedDigits.split(''));
  if (uniqueDigits.size <= 2) {
    alert('Số điện thoại không hợp lệ (chứa dãy số lặp lại không có thật)!');
    document.getElementById('customerPhone')?.focus();
    return;
  }

  // 3. Kiểm tra Email (nếu có)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      alert('Địa chỉ email không đúng định dạng (ví dụ: name@example.com).');
      document.getElementById('customerEmail')?.focus();
      return;
    }
  }

  // 4. Kiểm tra Tỉnh / Thành phố
  if (!city) {
    alert('Vui lòng nhập Tỉnh / Thành phố nhận hàng.');
    document.getElementById('customerCity')?.focus();
    return;
  }
  if (city.length < 3) {
    alert('Tên Tỉnh / Thành phố quá ngắn (tối thiểu 3 ký tự, ví dụ: Hà Nội, TP.HCM).');
    document.getElementById('customerCity')?.focus();
    return;
  }
  if (/^\d+$/.test(city)) {
    alert('Tên Tỉnh / Thành phố không thể chỉ gồm chữ số.');
    document.getElementById('customerCity')?.focus();
    return;
  }

  // 5. Kiểm tra Địa chỉ chi tiết (chặn gõ linh tinh, gõ bừa)
  const addressWords = address.split(/\s+/).filter(Boolean);
  const junkPatterns = [
    /^(linh\s*tinh|gõ\s*bừa|go\s*bua|không\s*có|ko\s*co|chưa\s*biết|asdf|qwerty|test|abc|xyz|nhà\s*tôi|o\s*day|ở\s*đây)/i,
    /(.)\1{4,}/,
  ];
  if (!address) {
    alert('Vui lòng nhập địa chỉ nhận hàng chi tiết.');
    document.getElementById('customerAddress')?.focus();
    return;
  }
  if (address.length < 8) {
    alert('Địa chỉ quá ngắn (tối thiểu 8 ký tự, ví dụ: Số 123 Lê Lợi)!');
    document.getElementById('customerAddress')?.focus();
    return;
  }
  if (/^\d+$/.test(address.replace(/[\s,.-]/g, ''))) {
    alert('Địa chỉ không hợp lệ (không thể chỉ gồm chữ số)!');
    document.getElementById('customerAddress')?.focus();
    return;
  }
  if (addressWords.length < 2) {
    alert('Địa chỉ không rõ ràng (cần tối thiểu 2 từ, gồm số nhà, tên đường hoặc thôn xóm)!');
    document.getElementById('customerAddress')?.focus();
    return;
  }
  if (junkPatterns.some((pattern) => pattern.test(address))) {
    alert('Địa chỉ chứa từ ngữ linh tinh hoặc không rõ ràng! Vui lòng nhập địa chỉ giao hàng thực tế.');
    document.getElementById('customerAddress')?.focus();
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    return;
  }

  const submitBtn = document.querySelector('.btn-submit-order');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      <span>Đang lưu đơn hàng...</span>
    `;
  }

  const subtotal = getCartSubtotal();
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  // Generate random Order Code e.g. ORD-839214
  const orderCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentNames = {
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'bank': 'Chuyển khoản ngân hàng (VietQR)',
    'momo': 'Ví điện tử MoMo / ZaloPay'
  };

  const paymentCode = paymentMethod === 'bank' ? 'VietQR' : (paymentMethod === 'momo' ? 'MoMo' : 'COD');

  // Chuẩn bị danh sách các món hàng (items)
  const items = cart.map(item => {
    const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
    const price = product ? product.price : 0;
    const name = product ? (product.nameEn || product.name) : ('Sản phẩm #' + item.id);
    return {
      id: item.id,
      product_id: item.id,
      name: name,
      price: price,
      quantity: item.quantity,
      image: product?.image || '',
      total: price * item.quantity
    };
  });

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Ghi đơn hàng vào bảng orders trong Supabase (chứa cả cột items jsonb)
      const orderPayload = {
        id: orderCode,
        customer_name: fullname,
        customer_phone: phone,
        customer_email: email || null,
        shipping_address: `${address}, ${city}`,
        payment_method: paymentCode,
        notes: notes || null,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        discount_amount: 0,
        total: totalAmount,
        status: 'Processing',
        items: items
      };

      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload]);

      if (orderError) {
        throw new Error(orderError.message || 'Lỗi khi ghi đơn hàng vào Supabase');
      }

      // 2. Ghi chi tiết từng sản phẩm vào bảng order_items
      const orderItemsRows = items.map(it => ({
        order_id: orderCode,
        product_id: it.product_id,
        product_name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsRows);

      if (itemsError) {
        console.warn('Lỗi ghi order_items (đơn chính đã tạo thành công):', itemsError);
      }
    } else {
      console.warn('Không tìm thấy Supabase client, đơn chỉ được lưu cục bộ.');
    }

    // Populate Order Success Modal
    const modalOrderCode = document.getElementById('modalOrderCode');
    const modalCustomerName = document.getElementById('modalCustomerName');
    const modalCustomerPhone = document.getElementById('modalCustomerPhone');
    const modalCustomerAddress = document.getElementById('modalCustomerAddress');
    const modalPaymentMethod = document.getElementById('modalPaymentMethod');
    const modalTotalAmount = document.getElementById('modalTotalAmount');

    if (modalOrderCode) modalOrderCode.textContent = orderCode;
    if (modalCustomerName) modalCustomerName.textContent = fullname;
    if (modalCustomerPhone) modalCustomerPhone.textContent = phone;
    if (modalCustomerAddress) modalCustomerAddress.textContent = `${address}, ${city}`;
    if (modalPaymentMethod) modalPaymentMethod.textContent = paymentNames[paymentMethod] || 'COD';
    if (modalTotalAmount) modalTotalAmount.textContent = formatPrice(totalAmount);

    // Lưu vào localStorage để hỗ trợ admin offline
    try {
      const stored = localStorage.getItem('mini_shop_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift({
        id: orderCode,
        customer: fullname,
        phone: phone,
        address: `${address}, ${city}`,
        items: cart,
        total: totalAmount,
        paymentMethod: paymentCode,
        notes: notes,
        status: 'Processing',
        date: new Date().toLocaleDateString('vi-VN')
      });
      localStorage.setItem('mini_shop_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn(e);
    }

    // Clear Shopping Cart in localStorage
    clearCart();

    // Show Modal Overlay
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
      modal.classList.add('show');
    }
  } catch (err) {
    console.error('Lỗi khi gửi đơn hàng:', err);
    alert('Không thể tạo đơn hàng trên Supabase: ' + (err.message || 'Vui lòng thử lại sau!'));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckoutPage);
} else {
  initCheckoutPage();
}
