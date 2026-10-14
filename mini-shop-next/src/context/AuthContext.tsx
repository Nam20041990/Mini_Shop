'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { useToast } from './ToastContext';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (name: string, email: string, password: string, role?: 'customer' | 'admin') => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUserToUser(sbUser: SupabaseUser | null): User | null {
  if (!sbUser) return null;

  const metadata = sbUser.user_metadata || {};
  const appMetadata = sbUser.app_metadata || {};
  const name =
    metadata.display_name ||
    metadata.name ||
    metadata.full_name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'Khách hàng');

  const role: 'admin' | 'customer' =
    metadata.role === 'admin' || appMetadata.role === 'admin'
      ? 'admin'
      : 'customer';

  const avatar =
    metadata.avatar ||
    metadata.avatar_url ||
    (role === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');

  return {
    id: sbUser.id,
    name,
    email: sbUser.email || '',
    role,
    avatar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // 1. Lấy phiên đăng nhập hiện tại từ Supabase (lưu trong session/cookies/localStorage)
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Lỗi kiểm tra phiên Supabase:', error.message);
        }
        if (mounted) {
          if (session?.user) {
            setUser(mapSupabaseUserToUser(session.user));
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Lỗi khởi tạo xác thực:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // 2. Lắng nghe sự kiện đăng nhập / đăng xuất / token refreshed từ Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(mapSupabaseUserToUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error('Supabase signInWithPassword error:', error);
        let message = 'Email hoặc mật khẩu không chính xác!';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email hoặc mật khẩu không chính xác.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Tài khoản chưa được kích hoạt xác nhận.';
        } else {
          message = error.message;
        }
        return { success: false, message };
      }

      if (data.user) {
        const mappedUser = mapSupabaseUserToUser(data.user);
        setUser(mappedUser);
        if (mappedUser) {
          showToast(`👋 Chào mừng quay trở lại, ${mappedUser.name}!`);
        }
        return { success: true, message: 'Đăng nhập thành công!', user: mappedUser || undefined };
      }

      return { success: false, message: 'Không thể đăng nhập. Vui lòng thử lại!' };
    } catch (err: any) {
      console.error('Lỗi khi đăng nhập:', err);
      return { success: false, message: err?.message || 'Có lỗi xảy ra khi kết nối hệ thống.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'customer' | 'admin' = 'customer'
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanName,
            name: cleanName,
            full_name: cleanName,
            role,
          },
        },
      });

      if (error) {
        console.error('Supabase signUp error:', error);
        let message = error.message;
        if (
          error.message.includes('User already registered') ||
          error.message.includes('already registered')
        ) {
          message = 'Email này đã được đăng ký tài khoản!';
        } else if (error.message.includes('Password should be')) {
          message = 'Mật khẩu phải có ít nhất 6 ký tự!';
        } else if (error.message.includes('invalid') && error.message.includes('email')) {
          message = 'Địa chỉ email không hợp lệ!';
        }
        return { success: false, message };
      }

      // Nếu Supabase chưa trả về session ngay, đăng nhập ngay lập tức bằng signInWithPassword
      if (!data.session) {
        const signInRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInRes.data.user) {
          const mappedUser = mapSupabaseUserToUser(signInRes.data.user);
          setUser(mappedUser);
          showToast(`🎉 Đăng ký tài khoản thành công!`);
          return { success: true, message: 'Đăng ký thành công!', user: mappedUser || undefined };
        }
      } else if (data.user) {
        const mappedUser = mapSupabaseUserToUser(data.user);
        setUser(mappedUser);
        showToast(`🎉 Đăng ký tài khoản thành công!`);
        return { success: true, message: 'Đăng ký thành công!', user: mappedUser || undefined };
      }

      showToast(`🎉 Đăng ký tài khoản thành công!`);
      return { success: true, message: 'Đăng ký tài khoản thành công!' };
    } catch (err: any) {
      console.error('Lỗi khi đăng ký:', err);
      return { success: false, message: err?.message || 'Có lỗi xảy ra khi tạo tài khoản.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    } finally {
      setUser(null);
      showToast('👋 Đã đăng xuất khỏi hệ thống.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
