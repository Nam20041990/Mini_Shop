'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') === 'new' ? 'newest' : 'newest';
  const initialSale = searchParams.get('sale') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentSort, setCurrentSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const categoriesList = [
    { id: 'all', name: 'Tất cả sản phẩm', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    )},
    { id: 'noi-that', name: 'Nội thất', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path><path d="M4 17v4"></path><path d="M20 17v4"></path></svg>
    )},
    { id: 'trang-tri', name: 'Trang trí', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    )},
    { id: 'nha-bep', name: 'Nhà bếp', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2v20M6 2v20M12 2v20"></path></svg>
    )},
    { id: 'den', name: 'Đèn', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M15 8a3 3 0 1 0-6 0c0 1.66.75 3.15 2 4.17V15a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-2.83A5.002 5.002 0 0 0 15 8z"></path></svg>
    )},
    { id: 'luu-tru', name: 'Lưu trữ', icon: (
      <svg className="filter-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
    )},
  ];

  const filteredProducts = useMemo(() => {
    let list = [...INITIAL_PRODUCTS].filter((p) => p.status !== 'Inactive');

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (initialSale) {
      list = list.filter((p) => Boolean(p.discount));
    }

    if (selectedPriceRange === 'under-500k') {
      list = list.filter((p) => p.price < 500000);
    } else if (selectedPriceRange === '500k-1m') {
      list = list.filter((p) => p.price >= 500000 && p.price <= 1000000);
    } else if (selectedPriceRange === '1m-3m') {
      list = list.filter((p) => p.price > 1000000 && p.price <= 3000000);
    } else if (selectedPriceRange === 'over-3m') {
      list = list.filter((p) => p.price > 3000000);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    }

    if (currentSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [selectedCategory, selectedPriceRange, inStockOnly, searchQuery, currentSort, initialSale]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setInStockOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-card">
            <h3 className="filter-title">Danh mục sản phẩm</h3>
            <ul className="filter-list" id="categoryFilterList">
              {categoriesList.map((cat) => {
                const count = cat.id === 'all'
                  ? INITIAL_PRODUCTS.length
                  : INITIAL_PRODUCTS.filter((p) => p.category === cat.id).length;
                const isActive = cat.id === selectedCategory;

                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`filter-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <div className="filter-item-left">
                        {cat.icon}
                        <span>{cat.name}</span>
                      </div>
                      <span className="filter-count">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="filter-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="filter-title">Khoảng giá</h3>
            <div className="price-filter-group">
              {[
                { id: 'all', label: 'Tất cả mức giá' },
                { id: 'under-500k', label: 'Dưới 500,000 VND' },
                { id: '500k-1m', label: '500,000 - 1,000,000 VND' },
                { id: '1m-3m', label: '1,000,000 - 3,000,000 VND' },
                { id: 'over-3m', label: 'Trên 3,000,000 VND' },
              ].map((range) => (
                <label key={range.id} className="radio-label">
                  <input
                    type="radio"
                    name="price-range"
                    value={range.id}
                    checked={selectedPriceRange === range.id}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="filter-title">Trạng thái</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>Chỉ hiển thị sản phẩm còn hàng</span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="search-filter-box">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="results-count" id="resultsCount">
              {searchQuery.trim()
                ? `Tìm thấy ${filteredProducts.length} kết quả cho "${searchQuery}"`
                : `Hiển thị 1–${filteredProducts.length} trong ${filteredProducts.length} sản phẩm`}
            </div>

            <div className="sort-box">
              <label htmlFor="sortSelect" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sắp xếp:</label>
              <select
                id="sortSelect"
                className="sort-select"
                value={currentSort}
                onChange={(e) => setCurrentSort(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="name-asc">Tên: A-Z</option>
              </select>
            </div>
          </div>

          <div className="product-grid" id="shopProductGrid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <button type="button" className="btn btn-outline" onClick={resetFilters}>
                  Hiển thị tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải danh sách sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
