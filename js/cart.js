/* Shopping Cart Engine & LocalStorage Manager for Mini Shop */

const CART_STORAGE_KEY = 'mini_shop_cart';

/**
 * Get cart items from localStorage
 * Returns array of { id: number, quantity: number }
 */
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

/**
 * Save cart items to localStorage and notify UI components
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateHeaderCartBadge();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

/**
 * Add a product to cart with specific quantity
 */
function addToCart(productId, quantity = 1, showNotification = true) {
  const numericId = parseInt(productId, 10);
  const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

  let cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === numericId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += qtyToAdd;
  } else {
    cart.push({ id: numericId, quantity: qtyToAdd });
  }

  saveCart(cart);

  // Trigger feedback
  if (showNotification) {
    const product = typeof getProductById === 'function' ? getProductById(numericId) : null;
    const productName = product ? (product.nameEn || product.name) : 'Sản phẩm';
    showCartToast(`🛒 Đã thêm ${qtyToAdd} x "${productName}" vào giỏ hàng!`);
  }
}

/**
 * Update quantity of a product in cart
 */
function updateCartQuantity(productId, newQty) {
  const numericId = parseInt(productId, 10);
  const qty = parseInt(newQty, 10);

  let cart = getCart();

  if (isNaN(qty) || qty <= 0) {
    removeFromCart(numericId);
    return;
  }

  const item = cart.find(item => item.id === numericId);
  if (item) {
    item.quantity = qty;
    saveCart(cart);
  }
}

/**
 * Remove a product from cart
 */
function removeFromCart(productId) {
  const numericId = parseInt(productId, 10);
  let cart = getCart();
  cart = cart.filter(item => item.id !== numericId);
  saveCart(cart);
}

/**
 * Clear all items from cart
 */
function clearCart() {
  saveCart([]);
}

/**
 * Calculate total number of items in cart
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Calculate subtotal amount for cart
 */
function getCartSubtotal() {
  const cart = getCart();
  if (typeof PRODUCTS_DATA === 'undefined') return 0;

  return cart.reduce((sum, item) => {
    const product = PRODUCTS_DATA.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

/**
 * Update the header cart badge count
 */
function updateHeaderCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-badge, #headerCartBadge');

  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('has-items');
      // Trigger pop animation effect
      badge.classList.remove('badge-pop');
      void badge.offsetWidth; // force reflow
      badge.classList.add('badge-pop');
    } else {
      badge.classList.remove('has-items');
    }
  });
}

/**
 * Global Toast Notification Helper for Cart Actions
 */
function showCartToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Auto update badge when document loads
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderCartBadge();
});
