
/* Product Detail Page Script (product-detail.js) */

function initProductDetail() {
  // 1. Render Reusable Header & Footer
  renderHeader('products');
  renderFooter();

  // 2. Extract product ID from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Fetch target product data
  const product = getProductById(productId);

  // Set document title
  document.title = `${product.name} - Mini Shop`;

  // 3. Populate Breadcrumb
  const breadcrumbCatEl = document.getElementById('breadcrumbCategory');
  const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
  const categoryDisplayName = typeof getCategoryName === 'function' ? getCategoryName(product.category) : (product.categoryName || 'Trang trí');

  if (breadcrumbCatEl) {
    breadcrumbCatEl.textContent = categoryDisplayName;
    breadcrumbCatEl.href = `products.html?cat=${product.category}`;
  }
  if (breadcrumbTitleEl) {
    breadcrumbTitleEl.textContent = product.name;
  }

  // 4. Populate Gallery Thumbnails & Main Image
  const mainImageEl = document.getElementById('mainProductImage');
  const thumbnailListEl = document.getElementById('thumbnailList');

  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.image, product.image, product.image, product.image];

  if (mainImageEl) {
    mainImageEl.src = galleryImages[0];
    mainImageEl.alt = product.name;
  }

  if (thumbnailListEl) {
    thumbnailListEl.innerHTML = galleryImages.map((imgSrc, index) => `
      <button type="button" class="thumb-btn ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${imgSrc}" alt="${product.name} thumbnail ${index + 1}">
      </button>
    `).join('');

    thumbnailListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.thumb-btn');
      if (!btn) return;

      const idx = parseInt(btn.dataset.index, 10);
      document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (mainImageEl) {
        mainImageEl.style.opacity = '0.4';
        setTimeout(() => {
          mainImageEl.src = galleryImages[idx];
          mainImageEl.style.opacity = '1';
        }, 150);
      }
    });
  }

  // 5. Populate Main Product Info
  const stockBadgeEl = document.getElementById('stockBadge');
  const categoryBadgeEl = document.getElementById('categoryBadge');
  const productTitleEl = document.getElementById('productTitle');
  const reviewsCountEl = document.getElementById('reviewsCount');
  const productPriceEl = document.getElementById('productPrice');
  const productOldPriceEl = document.getElementById('productOldPrice');
  const discountBadgeEl = document.getElementById('discountBadge');
  const productDescEl = document.getElementById('productDesc');

  if (stockBadgeEl) {
    if (product.inStock !== false && product.status !== 'Inactive') {
      stockBadgeEl.innerHTML = '<span class="stock-dot"></span> Còn hàng (In Stock)';
      stockBadgeEl.className = 'stock-status-badge in-stock';
    } else {
      stockBadgeEl.innerHTML = '<span class="stock-dot out"></span> Tạm hết hàng';
      stockBadgeEl.className = 'stock-status-badge out-stock';
    }
  }

  if (categoryBadgeEl) {
    categoryBadgeEl.textContent = categoryDisplayName;
  }

  if (productTitleEl) {
    productTitleEl.textContent = product.name;
  }

  if (reviewsCountEl) {
    reviewsCountEl.textContent = `(${product.reviewsCount || 36} đánh giá)`;
  }

  if (productPriceEl) {
    productPriceEl.textContent = formatPrice(product.price);
  }

  if (productOldPriceEl) {
    if (product.oldPrice && product.oldPrice > product.price) {
      productOldPriceEl.textContent = formatPrice(product.oldPrice);
      productOldPriceEl.style.display = 'inline-block';
    } else {
      productOldPriceEl.style.display = 'none';
    }
  }

  if (discountBadgeEl) {
    if (product.discount) {
      discountBadgeEl.textContent = product.discount;
      discountBadgeEl.style.display = 'inline-block';
    } else if (product.oldPrice && product.oldPrice > product.price) {
      const pct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      discountBadgeEl.textContent = `-${pct}%`;
      discountBadgeEl.style.display = 'inline-block';
    } else {
      discountBadgeEl.style.display = 'none';
    }
  }

  if (productDescEl) {
    productDescEl.textContent = product.desc || 'Sản phẩm thủ công cao cấp được chế tác tỉ mỉ, mang phong cách hiện đại và tinh tế cho không gian sống của bạn.';
  }

  // 6. Quantity Selector Logic
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const qtyInput = document.getElementById('qtyInput');

  if (btnQtyMinus && btnQtyPlus && qtyInput) {
    btnQtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
      }
    });

    btnQtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < 99) {
        qtyInput.value = val + 1;
      }
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) qtyInput.value = 1;
      if (val > 99) qtyInput.value = 99;
    });
  }

  // 7. Add to Cart & Wishlist Handlers
  const btnAddToCart = document.getElementById('btnAddToCart');
  const btnWishlist = document.getElementById('btnWishlist');

  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
      if (typeof addToCart === 'function') {
        addToCart(product.id, qty, true);
      } else {
        showToast(`🛒 Đã thêm ${qty} sản phẩm "${product.name}" vào giỏ hàng!`);
      }

      btnAddToCart.classList.add('added');
      setTimeout(() => btnAddToCart.classList.remove('added'), 600);
    });
  }

  if (btnWishlist) {
    btnWishlist.dataset.id = product.id;
    if (typeof isWishlisted === 'function' && isWishlisted(product.id)) {
      btnWishlist.classList.add('active');
      const heartSvg = btnWishlist.querySelector('svg');
      if (heartSvg) {
        heartSvg.setAttribute('fill', 'var(--danger-color)');
        heartSvg.setAttribute('stroke', 'var(--danger-color)');
      }
    }

    btnWishlist.addEventListener('click', () => {
      if (typeof toggleWishlist === 'function') {
        toggleWishlist(product.id, true);
      }
    });
  }

  // 8. Populate Sidebar Specs Card (Generate dynamic specs if missing)
  const details = generateProductDetails(product);

  const specMaterialEl = document.getElementById('specMaterial');
  const specColorEl = document.getElementById('specColor');
  const specDimensionsEl = document.getElementById('specDimensions');
  const specWeightEl = document.getElementById('specWeight');
  const specMadeInEl = document.getElementById('specMadeIn');

  if (specMaterialEl) specMaterialEl.textContent = details.material;
  if (specColorEl) specColorEl.textContent = details.color;
  if (specDimensionsEl) specDimensionsEl.textContent = details.dimensions;
  if (specWeightEl) specWeightEl.textContent = details.weight;
  if (specMadeInEl) specMadeInEl.textContent = details.madeIn;

  // 9. Render Related Products
  renderRelatedProducts(product.id, product.category);
}

/**
 * Intelligent Specs Generator for products that don't have explicit specifications
 */
function generateProductDetails(product) {
  if (product.details && product.details.material && product.details.dimensions) {
    return product.details;
  }

  const cat = product.category || 'trang-tri';
  const specsMap = {
    'noi-that': {
      material: "Gỗ tự nhiên & Vải nỉ đệm cao cấp",
      color: "Xám ghi / Kem / Gỗ tự nhiên",
      dimensions: "150cm x 75cm x 80cm",
      weight: "18.5 kg",
      madeIn: "Việt Nam"
    },
    'trang-tri': {
      material: "Gốm sứ Bát Tràng / Thuỷ tinh mỹ nghệ",
      color: "Trắng kem / Nâu mộc / Xanh pastel",
      dimensions: "25cm x 15cm x 30cm",
      weight: "1.2 kg",
      madeIn: "Việt Nam"
    },
    'nha-bep': {
      material: "Gỗ sồi Nga & Inox 304 không gỉ",
      color: "Vàng gỗ mộc / Bạc ánh kim",
      dimensions: "35cm x 25cm x 12cm",
      weight: "0.95 kg",
      madeIn: "Việt Nam"
    },
    'den': {
      material: "Tre tự nhiên đan tay & Khung sơn tĩnh điện",
      color: "Vàng tre mộc / Đen nhám",
      dimensions: "Đường kính 32cm, Cao 40cm",
      weight: "1.6 kg",
      madeIn: "Việt Nam"
    },
    'van-phong': {
      material: "Gỗ công nghiệp MDF chống ẩm & Khung thép",
      color: "Nâu gụ / Đen tuyền / Trắng",
      dimensions: "100cm x 50cm x 75cm",
      weight: "9.2 kg",
      madeIn: "Việt Nam"
    },
    'luu-tru': {
      material: "Mây tre đan thủ công mỹ nghệ cao cấp",
      color: "Vàng mây mộc / Nâu trầm",
      dimensions: "40cm x 30cm x 25cm",
      weight: "0.85 kg",
      madeIn: "Việt Nam"
    }
  };

  const base = specsMap[cat] || {
    material: "Vật liệu cao cấp chọn lọc",
    color: "Đa dạng màu sắc lựa chọn",
    dimensions: "Kích thước tiêu chuẩn",
    weight: "1.0 kg",
    madeIn: "Việt Nam"
  };

  return {
    material: (product.details && product.details.material) || base.material,
    color: (product.details && product.details.color) || base.color,
    dimensions: (product.details && product.details.dimensions) || base.dimensions,
    weight: (product.details && product.details.weight) || base.weight,
    madeIn: (product.details && product.details.madeIn) || base.madeIn
  };
}

// Toast notification helper
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Render Related Products Carousel
function renderRelatedProducts(currentId, currentCategory) {
  const gridEl = document.getElementById('relatedProductsGrid');
  if (!gridEl) return;

  const allProducts = typeof getStoreCatalogProducts === 'function' ? getStoreCatalogProducts() : PRODUCTS_DATA;

  // Get other products (prefer same category, then add others if needed)
  let related = allProducts.filter(p => String(p.id) !== String(currentId) && p.category === currentCategory);
  if (related.length < 5) {
    const others = allProducts.filter(p => String(p.id) !== String(currentId) && p.category !== currentCategory);
    related = [...related, ...others];
  }
  related = related.slice(0, 6);

  gridEl.innerHTML = related.map(p => {
    const displayName = p.name;
    return `
      <div class="product-card related-card" onclick="location.href='product-detail.html?id=${p.id}'" style="cursor: pointer;">
        <div class="product-thumb">
          <img src="${p.image}" alt="${displayName}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-name">${displayName}</h3>
          <div class="price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
          </div>
          <div class="rating-row compact">
            <div class="stars-list compact">
              <svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span class="reviews-count">(${p.reviewsCount || 35})</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Setup Carousel Navigation
  const btnPrev = document.getElementById('btnPrevRelated');
  const btnNext = document.getElementById('btnNextRelated');

  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      gridEl.scrollBy({ left: -260, behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
      gridEl.scrollBy({ left: 260, behavior: 'smooth' });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetail);
} else {
  initProductDetail();
}
