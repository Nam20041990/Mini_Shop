import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'Mini Shop - Cửa hàng đồ dùng & trang trí gia đình',
  description: 'Cửa hàng trực tuyến mua sắm đồ nội thất, trang trí gia đình, đèn và đồ dùng nhà bếp cao cấp.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div id="site-header">
                  <Suspense fallback={null}>
                    <Header />
                  </Suspense>
                </div>
                <main id="main-content">{children}</main>
                <div id="site-footer">
                  <Footer />
                </div>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
