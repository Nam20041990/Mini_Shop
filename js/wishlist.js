/* Wishlist (Yêu thích) Engine & LocalStorage Manager for Mini Shop */

const WISHLIST_STORAGE_KEY = 'mini_shop_wishlist';

/**
 * Get array of wishlisted product IDs from localStorage
 * Returns array of numbers: e.g. [1, 7, 4]
 */
function getWishlist() {
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading wishlist from localStorage', e);
    return [];
  }
}

/**
 * Save wishlist array to localStorage and notify UI components
 */
function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    updateHeaderWishlistBadge();
    syncWishlistButtonsOnPage();
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { wishlist } }));
  } catch (e) {
    console.error('Error saving wishlist to localStorage', e);
  }
}

/**
 * Check if a product ID is in the wishlist
 */
function isWishlisted(productId) {
  const numericId = parseInt(productId, 10);
  const wishlist = getWishlist();
  return wishlist.includes(numericId);
}

/**
 * Toggle wishlist status for a product
 * Returns boolean (true if added, false if removed)
 */
function toggleWishlist(productId, showNotification = true) {
  const numericId = parseInt(productId, 10);
  let wishlist = getWishlist();
  const exists = wishlist.includes(numericId);
  let isAdded = false;

  if (exists) {
    wishlist = wishlist.filter(id => id !== numericId);
    isAdded = false;
  } else {
    wishlist.push(numericId);
    isAdded = true;
  }

  saveWishlist(wishlist);

  if (showNotification) {
    const product = typeof getProductById === 'function' ? getProductById(numericId) : null;
    const productName = product ? (product.nameEn || product.name) : 'Sản phẩm';

    if (typeof showCartToast === 'function') {
      if (isAdded) {
        showCartToast(`❤️ Đã thêm "${productName}" vào danh sách yêu thích!`);
      } else {
        showCartToast(`Đã xóa "${productName}" khỏi danh sách yêu thích.`);
      }
    }
  }

  return isAdded;
}

/**
 * Calculate total number of wishlisted items
 */
function getWishlistCount() {
  return getWishlist().length;
}

/**
 * Update header wishlist badge count
 */
function updateHeaderWishlistBadge() {
  const count = getWishlistCount();
  const badges = document.querySelectorAll('.wishlist-badge, #headerWishlistBadge');

  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('has-items');
      badge.classList.remove('badge-pop');
      void badge.offsetWidth; // force reflow
      badge.classList.add('badge-pop');
    } else {
      badge.classList.remove('has-items');
    }
  });
}

/**
 * Synchronize state of all heart/wishlist buttons currently in the DOM
 */
function syncWishlistButtonsOnPage() {
  const wishlist = getWishlist();

  // 1. Synchronize Product Cards Heart Buttons (elements with data-wishlist-id or onclick)
  const wishlistBtns = document.querySelectorAll('.btn-wishlist[data-id]');
  wishlistBtns.forEach(btn => {
    const id = parseInt(btn.dataset.id, 10);
    const active = wishlist.includes(id);
    const svg = btn.querySelector('svg');

    if (active) {
      btn.classList.add('active');
      if (svg) {
        svg.setAttribute('fill', 'var(--danger-color)');
        svg.setAttribute('stroke', 'var(--danger-color)');
      }
      btn.style.color = 'var(--danger-color)';
    } else {
      btn.classList.remove('active');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
      btn.style.color = 'var(--text-muted)';
    }
  });

  // 2. Synchronize Product Detail Page Wishlist Button (#btnWishlist)
  const detailBtn = document.getElementById('btnWishlist');
  if (detailBtn && detailBtn.dataset.id) {
    const detailId = parseInt(detailBtn.dataset.id, 10);
    const active = wishlist.includes(detailId);
    const svg = detailBtn.querySelector('svg');

    if (active) {
      detailBtn.classList.add('active');
      if (svg) {
        svg.setAttribute('fill', 'var(--danger-color)');
        svg.setAttribute('stroke', 'var(--danger-color)');
      }
    } else {
      detailBtn.classList.remove('active');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  }
}

// Auto update badge and sync buttons on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderWishlistBadge();
  syncWishlistButtonsOnPage();
});
