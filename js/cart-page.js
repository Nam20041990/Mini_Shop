/* Shopping Cart Page Renderer & Logic (js/cart-page.js) */

function initCartPage() {
  // 1. Render Header & Footer
  renderHeader('cart');
  renderFooter();

  // 2. Initial Render of Cart Page
  renderCartPage();

  // 3. Listen for cart update events
  window.addEventListener('cart-updated', () => {
    renderCartPage();
  });
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById('cartItemsList');
  const cartSummaryContainer = document.getElementById('cartSummaryContent');
  const cartHeaderTitleCount = document.getElementById('cartTitleCount');

  if (!cartItemsContainer) return;

  const cart = getCart();

  // Update title count
  if (cartHeaderTitleCount) {
    const totalCount = getCartCount();
    cartHeaderTitleCount.textContent = `(${totalCount} sản phẩm)`;
  }

  // Handle Empty Cart State
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-box">
        <div class="cart-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h2 class="cart-empty-title">Giỏ hàng của bạn đang trống</h2>
        <p class="cart-empty-desc">Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay các sản phẩm độc đáo của Mini Shop nhé!</p>
        <a href="products.html" class="btn btn-primary btn-lg">
          <span>Khám phá sản phẩm</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    `;

    if (cartSummaryContainer) {
      cartSummaryContainer.innerHTML = `
        <div class="summary-card empty-summary">
          <h3 class="summary-title">Tóm tắt đơn hàng</h3>
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>0 VND</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0 VND</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row summary-total">
            <span>Tổng thanh toán:</span>
            <span class="total-price">0 VND</span>
          </div>
          <button class="btn btn-primary btn-checkout" disabled style="opacity: 0.5; cursor: not-allowed; width: 100%; margin-top: 1rem;">
            Thanh toán
          </button>
        </div>
      `;
    }
    return;
  }

  // Render Items List
  let subtotal = 0;

  const itemsHtml = cart.map(item => {
    const product = getProductById(item.id);
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;
    const name = product.nameEn || product.name;

    return `
      <div class="cart-item-card" data-id="${product.id}">
        <div class="cart-item-thumb" onclick="location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
          <img src="${product.image}" alt="${name}">
        </div>

        <div class="cart-item-info">
          <div class="cart-item-cat">${product.categoryName || 'Sản phẩm'}</div>
          <h3 class="cart-item-title">
            <a href="product-detail.html?id=${product.id}">${name}</a>
          </h3>
          <div class="cart-item-unit-price">${formatPrice(product.price)}</div>
        </div>

        <div class="cart-item-qty">
          <div class="quantity-controls compact">
            <button type="button" class="qty-btn" onclick="handleCartQtyChange(${product.id}, -1)" aria-label="Decrease quantity">-</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" onchange="handleCartQtyInput(${product.id}, this.value)">
            <button type="button" class="qty-btn" onclick="handleCartQtyChange(${product.id}, 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div class="cart-item-subtotal">
          <span class="subtotal-label">Thành tiền:</span>
          <span class="subtotal-val">${formatPrice(itemSubtotal)}</span>
        </div>

        <button type="button" class="cart-item-remove" onclick="handleRemoveItem(${product.id})" title="Xóa sản phẩm" aria-label="Delete item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  cartItemsContainer.innerHTML = `
    <div class="cart-items-wrapper">
      <div class="cart-items-header-bar">
        <span>Danh sách sản phẩm</span>
        <button type="button" class="btn-clear-cart" onclick="handleClearAllCart()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Xóa tất cả
        </button>
      </div>
      <div class="cart-items-list-body">
        ${itemsHtml}
      </div>
    </div>
  `;

  // Calculate Shipping (Free if subtotal >= 500.000, else 30.000)
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  if (cartSummaryContainer) {
    cartSummaryContainer.innerHTML = `
      <div class="summary-card">
        <h3 class="summary-title">Tóm tắt đơn hàng</h3>
        
        <div class="summary-row">
          <span>Tạm tính:</span>
          <span class="summary-val">${formatPrice(subtotal)}</span>
        </div>
        
        <div class="summary-row">
          <span>Phí vận chuyển:</span>
          <span class="summary-val">${shippingFee === 0 ? '<strong style="color: var(--primary-color);">Miễn phí</strong>' : formatPrice(shippingFee)}</span>
        </div>

        ${shippingFee > 0 ? `
          <div class="free-shipping-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Mua thêm <strong>${formatPrice(500000 - subtotal)}</strong> để được Miễn phí giao hàng!
          </div>
        ` : `
          <div class="free-shipping-badge">
            🎉 Đơn hàng đủ điều kiện Miễn Phí Vận Chuyển!
          </div>
        `}

        <div class="summary-divider"></div>

        <div class="summary-row summary-total">
          <span>Tổng cộng:</span>
          <span class="total-price">${formatPrice(grandTotal)}</span>
        </div>

        <button type="button" class="btn btn-primary btn-checkout" onclick="handleCheckout()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <span>Tiến hành đặt hàng</span>
        </button>

        <div class="summary-benefits">
          <div class="benefit-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Bảo mật thông tin 100%</span>
          </div>
          <div class="benefit-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <span>Giao hàng tận nơi toàn quốc</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Global Event Handlers for Cart Actions
window.handleCartQtyChange = function(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    const newQty = item.quantity + delta;
    updateCartQuantity(productId, newQty);
  }
};

window.handleCartQtyInput = function(productId, valStr) {
  const newQty = parseInt(valStr, 10);
  updateCartQuantity(productId, isNaN(newQty) ? 1 : newQty);
};

window.handleRemoveItem = function(productId) {
  const product = getProductById(productId);
  const name = product ? (product.nameEn || product.name) : 'Sản phẩm';
  removeFromCart(productId);
  showCartToast(`Đã xóa "${name}" khỏi giỏ hàng.`);
};

window.handleClearAllCart = function(confirmClear = true) {
  if (confirmClear && !confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
    return;
  }
  clearCart();
  showCartToast('Đã xóa tất cả sản phẩm trong giỏ hàng.');
};

window.handleCheckout = function() {
  const cart = getCart();
  if (!cart || cart.length === 0) {
    showCartToast('Giỏ hàng của bạn đang trống!');
    return;
  }
  window.location.href = 'checkout.html';
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartPage);
} else {
  initCartPage();
}
