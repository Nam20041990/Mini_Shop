/* Wishlist Page Renderer & Logic (js/wishlist-page.js) */

function initWishlistPage() {
  // 1. Render Header & Footer
  renderHeader('wishlist');
  renderFooter();

  // 2. Initial Render of Wishlist Page
  renderWishlistPage();

  // 3. Listen for wishlist update events
  window.addEventListener('wishlist-updated', () => {
    renderWishlistPage();
  });
}

function renderWishlistPage() {
  const wishlistContainer = document.getElementById('wishlistGrid');
  const wishlistTitleCount = document.getElementById('wishlistTitleCount');

  if (!wishlistContainer) return;

  const wishlistIds = getWishlist();

  if (wishlistTitleCount) {
    wishlistTitleCount.textContent = `(${wishlistIds.length} sản phẩm)`;
  }

  // Handle Empty Wishlist State
  if (wishlistIds.length === 0) {
    wishlistContainer.innerHTML = `
      <div class="wishlist-empty-box">
        <div class="wishlist-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h2 class="wishlist-empty-title">Danh sách yêu thích của bạn đang trống</h2>
        <p class="wishlist-empty-desc">Hãy bấm vào biểu tượng trái tim trên các sản phẩm bạn yêu thích để lưu lại và xem lại bất cứ lúc nào!</p>
        <a href="products.html" class="btn btn-primary btn-lg">
          <span>Khám phá sản phẩm ngay</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  // Render Product Cards for Wishlisted Items
  const products = wishlistIds.map(id => getProductById(id)).filter(Boolean);

  wishlistContainer.innerHTML = `
    <div class="wishlist-grid-wrapper">
      <div class="wishlist-header-bar">
        <span>Sản phẩm bạn đã lưu (${products.length})</span>
        <button type="button" class="btn-clear-wishlist" onclick="handleClearWishlist()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Xóa tất cả
        </button>
      </div>

      <div class="product-grid wishlist-cards-grid">
        ${products.map(p => `
          <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor: pointer;">
            <div class="product-thumb">
              ${p.badge ? `<span class="badge-tag ${p.badgeType || 'new'}">${p.badge}</span>` : ''}
              <button type="button" class="btn-wishlist active" data-id="${p.id}" aria-label="Remove from wishlist" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
                <svg viewBox="0 0 24 24" fill="var(--danger-color)" stroke="var(--danger-color)" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-info">
              <h3 class="product-name"><a href="product-detail.html?id=${p.id}" onclick="event.stopPropagation()">${p.name}</a></h3>
              <div class="price-row">
                <span class="product-price">${formatPrice(p.price)}</span>
                ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}
              </div>
              <p class="product-desc">${p.desc}</p>
              <div class="card-action-row">
                <button type="button" class="btn-card-add-cart" onclick="event.stopPropagation(); addToCart(${p.id}, 1)" title="Thêm vào giỏ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Thêm giỏ</span>
                </button>
                <button type="button" class="btn-detail btn-remove-wish" onclick="event.stopPropagation(); toggleWishlist(${p.id})" title="Bỏ yêu thích" style="color: var(--danger-color); border-color: #fecaca; background-color: #fef2f2;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>Bỏ thích</span>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.handleClearWishlist = function() {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
    saveWishlist([]);
    if (typeof showCartToast === 'function') {
      showCartToast('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích.');
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWishlistPage);
} else {
  initWishlistPage();
}
