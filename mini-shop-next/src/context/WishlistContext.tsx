'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '@/data/products';
import { useToast } from './ToastContext';

const WISHLIST_STORAGE_KEY = 'mini_shop_wishlist';

interface WishlistContextType {
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  isWishlisted: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  totalCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (data) {
        setWishlist(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error reading wishlist from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlist, isLoaded]);

  const toggleWishlist = (productId: number) => {
    const numericId = Number(productId);
    const product = INITIAL_PRODUCTS.find((p) => p.id === numericId);
    const productName = product ? (product.nameEn || product.name) : 'Sản phẩm';

    setWishlist((prev) => {
      if (prev.includes(numericId)) {
        showToast(`💔 Đã xóa "${productName}" khỏi danh sách yêu thích!`, 'info');
        return prev.filter((id) => id !== numericId);
      } else {
        showToast(`❤️ Đã thêm "${productName}" vào danh sách yêu thích!`, 'success');
        return [...prev, numericId];
      }
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlist.includes(Number(productId));
  };

  const removeFromWishlist = (productId: number) => {
    const numericId = Number(productId);
    const product = INITIAL_PRODUCTS.find((p) => p.id === numericId);
    const productName = product ? (product.nameEn || product.name) : 'Sản phẩm';

    setWishlist((prev) => prev.filter((id) => id !== numericId));
    showToast(`💔 Đã xóa "${productName}" khỏi danh sách yêu thích!`, 'info');
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích!', 'info');
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlisted: isInWishlist,
        removeFromWishlist,
        clearWishlist,
        getWishlistCount,
        totalCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
