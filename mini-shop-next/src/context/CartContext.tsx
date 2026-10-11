'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem } from '@/types/cart';
import { Product } from '@/types/product';
import { INITIAL_PRODUCTS } from '@/data/products';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'mini_shop_cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: number, quantity?: number, showToastNotify?: boolean) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: (productsList?: Product[]) => number;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [rawCart, setRawCart] = useState<{ id: number; quantity: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      if (data) {
        setRawCart(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawCart));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [rawCart, isLoaded]);

  // Read stored products if modified in admin
  const allProducts = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mini_shop_products');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  }, [rawCart]);

  // Populated Cart with product details
  const cart: CartItem[] = useMemo(() => {
    return rawCart.map((item) => {
      const prod = allProducts.find((p: Product) => p.id === item.id) || {
        id: item.id,
        name: 'Sản phẩm',
        price: 0,
        category: 'other',
        desc: '',
        image: '/assets/images/banner/banner-trang-chu-mini-shop.webp',
      };
      return {
        id: item.id,
        quantity: item.quantity,
        product: prod,
      };
    });
  }, [rawCart, allProducts]);

  const totalCount = useMemo(() => {
    return rawCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [rawCart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.product ? item.product.price : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const addToCart = (productId: number, quantity = 1, showToastNotify = true) => {
    const numericId = Number(productId);
    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    setRawCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === numericId);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + qtyToAdd,
        };
        return newCart;
      }
      return [...prevCart, { id: numericId, quantity: qtyToAdd }];
    });

    if (showToastNotify) {
      const product = allProducts.find((p: Product) => p.id === numericId);
      const name = product ? (product.nameEn || product.name) : 'Sản phẩm';
      showToast(`🛒 Đã thêm ${qtyToAdd} x "${name}" vào giỏ hàng!`, 'success');
    }
  };

  const updateQuantity = (productId: number, newQty: number) => {
    const numericId = Number(productId);
    const qty = Number(newQty);

    if (isNaN(qty) || qty <= 0) {
      removeFromCart(numericId);
      return;
    }

    setRawCart((prevCart) =>
      prevCart.map((item) => (item.id === numericId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (productId: number) => {
    const numericId = Number(productId);
    setRawCart((prevCart) => prevCart.filter((item) => item.id !== numericId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
  };

  const clearCart = () => {
    setRawCart([]);
    showToast('Đã dọn sạch giỏ hàng!', 'info');
  };

  const getCartCount = () => totalCount;

  const getCartSubtotal = () => subtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartSubtotal,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
