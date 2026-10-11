'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const success = login(email, password);
    if (success) {
      showToast('Đăng nhập thành công!', 'success');
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setErrorMessage('Email hoặc mật khẩu không chính xác.');
      showToast('Đăng nhập thất bại. Vui lòng kiểm tra lại!', 'danger');
    }
  };

  const handleDemoLogin = (role: 'customer' | 'admin') => {
    setErrorMessage('');
    if (role === 'customer') {
      login('khachhang@gmail.com', 'user123');
      showToast('Đăng nhập thành công với tài khoản Khách!', 'success');
      router.push('/');
    } else {
      login('admin@minishop.com', 'admin123');
      showToast('Đăng nhập thành công với quyền Quản trị viên (Admin)!', 'success');
      router.push('/admin');
    }
  };

  return (
    <div className="auth-main-wrapper">
      <div className="container">
        <div className="auth-card-container">
          <div className="auth-card-header">
            <div className="auth-tabs">
              <Link href="/login" className="auth-tab-btn active">
                Đăng Nhập
              </Link>
              <Link href="/register" className="auth-tab-btn">
                Đăng Ký
              </Link>
            </div>
          </div>

          <div className="auth-card-body">
            <div className="auth-intro">
              <h1 className="auth-title">Chào mừng trở lại!</h1>
              <p className="auth-subtitle">
                Nhập thông tin đăng nhập hoặc sử dụng tài khoản thử nghiệm bên dưới.
              </p>
            </div>

            {errorMessage && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  border: '1px solid #fecaca',
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Quick Demo Login Section */}
            <div className="quick-demo-section">
              <div className="quick-demo-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Thử nghiệm 1-Click (Đăng nhập Nhanh)</span>
              </div>
              <div className="quick-demo-grid">
                <button
                  type="button"
                  className="btn-demo-account demo-customer"
                  onClick={() => handleDemoLogin('customer')}
                >
                  <div className="demo-icon">👤</div>
                  <div className="demo-text">
                    <strong>Tài khoản Khách</strong>
                    <small>khachhang@gmail.com / user123</small>
                  </div>
                  <span className="demo-badge">Vào Trang Khách</span>
                </button>

                <button
                  type="button"
                  className="btn-demo-account demo-admin"
                  onClick={() => handleDemoLogin('admin')}
                >
                  <div className="demo-icon">🛡️</div>
                  <div className="demo-text">
                    <strong>Tài khoản Admin</strong>
                    <small>admin@minishop.com / admin123</small>
                  </div>
                  <span className="demo-badge admin">Vào Khu Quản Trị</span>
                </button>
              </div>
            </div>

            <div className="auth-divider">
              <span>hoặc đăng nhập thủ công</span>
            </div>

            <form onSubmit={handleManualLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Địa chỉ Email</label>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nhapemail@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Mật khẩu</label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() =>
                      showToast(
                        'Demo mật khẩu: admin@minishop.com (pass: admin123) hoặc khachhang@gmail.com (pass: user123)',
                        'info'
                      )
                    }
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-auth-submit">
                <span>Đăng Nhập</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div className="auth-card-footer">
              <p>
                Chưa có tài khoản?{' '}
                <Link href="/register" className="auth-switch-link">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
