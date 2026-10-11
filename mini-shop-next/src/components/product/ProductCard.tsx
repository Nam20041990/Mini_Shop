'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatPrice } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWish = isInWishlist(product.id);

  return (
    <div className="product-card" style={{ cursor: 'pointer' }}>
      <div className="product-thumb">
        {product.badge && (
          <span className={`badge-tag ${product.badgeType || 'new'}`}>{product.badge}</span>
        )}
        <button
          type="button"
          className={`btn-wishlist ${isWish ? 'active' : ''}`}
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isWish ? 'var(--danger-color)' : 'none'}
            stroke={isWish ? 'var(--danger-color)' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <Link href={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        {product.inStock && (
          <span className="stock-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Còn hàng</span>
          </span>
        )}
        <p className="product-desc">{product.desc}</p>
        <div className="card-action-row">
          <button
            type="button"
            className="btn-card-add-cart"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id, 1);
            }}
            title="Thêm vào giỏ"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Thêm giỏ</span>
          </button>
          <Link href={`/products/${product.id}`} className="btn-detail">
            <span>Chi tiết</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
