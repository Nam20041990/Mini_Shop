'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không khớp!');
      showToast('Mật khẩu nhập lại không khớp!', 'danger');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự!');
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
      return;
    }

    const success = register(name, email, password);
    if (success) {
      showToast('Đăng ký tài khoản thành công! Đã tự động đăng nhập.', 'success');
      router.push('/');
    } else {
      setErrorMessage('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
      showToast('Email đã tồn tại!', 'danger');
    }
  };

  return (
    <div className="auth-main-wrapper">
      <div className="container">
        <div className="auth-card-container">
          <div className="auth-card-header">
            <div className="auth-tabs">
              <Link href="/login" className="auth-tab-btn">
                Đăng Nhập
              </Link>
              <Link href="/register" className="auth-tab-btn active">
                Đăng Ký
              </Link>
            </div>
          </div>

          <div className="auth-card-body">
            <div className="auth-intro">
              <h1 className="auth-title">Tạo tài khoản mới</h1>
              <p className="auth-subtitle">
                Đăng ký để tận hưởng trải nghiệm mua sắm và nhận ưu đãi độc quyền từ Mini Shop.
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

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Họ và tên của bạn</label>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-auth-submit">
                <span>Tạo Tài Khoản</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div className="auth-card-footer">
              <p>
                Đã có tài khoản?{' '}
                <Link href="/login" className="auth-switch-link">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
