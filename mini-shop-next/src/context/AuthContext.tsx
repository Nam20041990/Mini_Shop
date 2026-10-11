'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { useToast } from './ToastContext';

const AUTH_STORAGE_KEY = 'mini_shop_current_user';
const USERS_STORAGE_KEY = 'mini_shop_registered_users';

const MOCK_ADMIN_ACCOUNT: User = {
  id: 'admin-001',
  name: 'Quản trị viên Admin',
  email: 'admin@minishop.com',
  password: 'admin123',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
};

const MOCK_CUSTOMER_ACCOUNT: User = {
  id: 'user-001',
  name: 'Nguyễn Văn Khách',
  email: 'khachhang@gmail.com',
  password: 'user123',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string; user?: User };
  register: (name: string, email: string, password: string, role?: 'customer' | 'admin') => { success: boolean; message: string; user?: User };
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const existing = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([MOCK_ADMIN_ACCOUNT, MOCK_CUSTOMER_ACCOUNT]));
      }
      const currentUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (currentUser) {
        setUser(JSON.parse(currentUser));
      }
    } catch (e) {
      console.error('Error initializing Auth context:', e);
    }
    setIsLoaded(true);
  }, []);

  const getUsersPool = (): User[] => {
    try {
      const existing = localStorage.getItem(USERS_STORAGE_KEY);
      return existing ? JSON.parse(existing) : [MOCK_ADMIN_ACCOUNT, MOCK_CUSTOMER_ACCOUNT];
    } catch (e) {
      return [MOCK_ADMIN_ACCOUNT, MOCK_CUSTOMER_ACCOUNT];
    }
  };

  const login = (email: string, password: string) => {
    const users = getUsersPool();
    const found = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );

    if (found) {
      const safeUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        avatar: found.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };
      setUser(safeUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
      showToast(`👋 Chào mừng quay trở lại, ${safeUser.name}!`);
      return { success: true, message: 'Đăng nhập thành công!', user: safeUser };
    }
    return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
  };

  const register = (name: string, email: string, password: string, role: 'customer' | 'admin' = 'customer') => {
    const users = getUsersPool();
    const existing = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());

    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký tài khoản!' };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      avatar: role === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    };

    setUser(safeUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    showToast(`🎉 Đăng ký tài khoản thành công!`);

    return { success: true, message: 'Đăng ký tài khoản thành công!', user: safeUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('👋 Đã đăng xuất khỏi hệ thống.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
