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

function handleOrderSubmit(e) {
  e.preventDefault();

  const fullname = document.getElementById('customerName')?.value.trim();
  const phone = document.getElementById('customerPhone')?.value.trim();
  const address = document.getElementById('customerAddress')?.value.trim();
  const city = document.getElementById('customerCity')?.value.trim();
  const notes = document.getElementById('customerNotes')?.value.trim();
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod';

  if (!fullname || !phone || !address || !city) {
    alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    return;
  }

  const subtotal = getCartSubtotal();
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  // Generate random Order Code e.g. MS-839214
  const orderCode = `MS-${Math.floor(100000 + Math.random() * 900000)}`;

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
  if (modalPaymentMethod) {
    const paymentNames = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'bank': 'Chuyển khoản ngân hàng QR-Code',
      'momo': 'Ví điện tử MoMo / ZaloPay'
    };
    modalPaymentMethod.textContent = paymentNames[paymentMethod] || 'COD';
  }
  if (modalTotalAmount) modalTotalAmount.textContent = formatPrice(totalAmount);

  // Clear Shopping Cart in localStorage
  clearCart();

  // Show Modal Overlay
  const modal = document.getElementById('orderSuccessModal');
  if (modal) {
    modal.classList.add('show');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckoutPage);
} else {
  initCheckoutPage();
}
