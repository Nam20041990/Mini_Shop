'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand Info & Socials */}
          <div className="footer-brand">
            <Link href="/" className="logo">
              <div className="logo-icon-box">
                <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
                </svg>
              </div>
              <span className="logo-text">Mini Shop</span>
            </Link>
            <p className="footer-tagline">
              Quality home & lifestyle products for a better living.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31 0 2.591.26 3.766.757.2.086.37.24.455.441.135.318.06.69-.17.935a8.775 8.775 0 0 1-3.32 2.055c-.244.093-.509.07-.735-.062a4.42 4.42 0 0 0-2.383-.706c-2.48 0-4.5 2.02-4.5 4.5 0 2.48 2.02 4.5 4.5 4.5 2.48 0 4.5-2.02 4.5-4.5V5.5a7.97 7.97 0 0 0 5-1.75v2.85A10.97 10.97 0 0 1 14.525.02z" transform="translate(0, 3)"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: SHOP */}
          <div>
            <h4 className="footer-heading">SHOP</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">All Products</Link></li>
              <li><Link href="/products">Categories</Link></li>
              <li><Link href="/products?sort=new">New Arrivals</Link></li>
              <li><Link href="/products?sale=true">Sale</Link></li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER SERVICE */}
          <div>
            <h4 className="footer-heading">CUSTOMER SERVICE</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Shipping & Delivery</a></li>
              <li><a href="#">Returns & Refunds</a></li>
              <li><a href="#">Warranty</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          {/* Column 4: ABOUT US */}
          <div>
            <h4 className="footer-heading">ABOUT US</h4>
            <ul className="footer-links">
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div>
            <h4 className="footer-heading">CONTACT</h4>
            <ul className="footer-contact-list">
              <li className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>123 Nguyen Hue, District 1<br/>Ho Chi Minh City, Vietnam</span>
              </li>
              <li className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>0123 456 789</span>
              </li>
              <li className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>support@minishop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Mini Shop. All rights reserved.</p>
          <div className="payment-methods">
            <span className="payment-badge visa">VISA</span>
            <span className="payment-badge mc">Mastercard</span>
            <span className="payment-badge momo">MoMo</span>
            <span className="payment-badge zalopay">ZaloPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
