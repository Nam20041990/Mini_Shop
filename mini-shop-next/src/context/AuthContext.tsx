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
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, role?: 'customer' | 'admin') => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREDEFINED_ADMIN_EMAILS = ['trannamnb202@gmail.com', 'admin@minishop.com'];

function mapSupabaseUserToUser(sbUser: SupabaseUser | null): User | null {
  if (!sbUser) return null;

  const metadata = sbUser.user_metadata || {};
  const appMetadata = sbUser.app_metadata || {};
  const userEmail = sbUser.email ? sbUser.email.toLowerCase().trim() : '';

  const name =
    metadata.display_name ||
    metadata.name ||
    metadata.full_name ||
    (userEmail ? userEmail.split('@')[0] : 'Khách hàng');

  const isPredefinedAdmin = PREDEFINED_ADMIN_EMAILS.includes(userEmail);

  const role: 'admin' | 'customer' =
    metadata.role === 'admin' || appMetadata.role === 'admin' || isPredefinedAdmin
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
      const cleanEmail = email.trim().toLowerCase();

      console.log('🔄 [AuthContext login] Bắt đầu xác thực Supabase Auth:', {
        email: cleanEmail,
        passwordProvided: Boolean(password),
        passwordLength: password ? password.length : 0,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error('❌ [Supabase signInWithPassword Error]:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code,
          details: (error as any).details,
          attemptedEmail: cleanEmail,
        });

        let message = 'Email hoặc mật khẩu không chính xác!';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email hoặc mật khẩu không chính xác (Invalid login credentials).';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Tài khoản chưa được kích hoạt xác nhận qua email.';
        } else {
          message = error.message;
        }
        return { success: false, message };
      }

      if (data.user) {
        const mappedUser = mapSupabaseUserToUser(data.user);
        setUser(mappedUser);

        console.log('✅ [AuthContext login] Đăng nhập Supabase thành công:', {
          id: data.user.id,
          email: data.user.email,
          role: mappedUser?.role,
          metadata: data.user.user_metadata,
        });

        if (mappedUser?.role !== 'admin') {
          console.warn(
            '⚠️ [AuthContext] Lưu ý: Tài khoản đăng nhập có role là "' +
              mappedUser?.role +
              '". Để vào /admin, user_metadata trong Supabase Auth cần có role: "admin".'
          );
        }

        if (mappedUser) {
          showToast(`👋 Chào mừng quay trở lại, ${mappedUser.name}!`);
        }
        return { success: true, message: 'Đăng nhập thành công!', user: mappedUser || undefined };
      }

      return { success: false, message: 'Không thể đăng nhập. Vui lòng thử lại!' };
    } catch (err: any) {
      console.error('🚨 [AuthContext login Exception]:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
      });
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

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔄 [AuthContext] Bắt đầu xác thực bằng Google OAuth...');
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ [Google OAuth Error]:', error);
        return { success: false, message: error.message || 'Lỗi đăng nhập Google.' };
      }

      return { success: true, message: 'Đang chuyển hướng sang Google...' };
    } catch (err: any) {
      console.error('🚨 [Google OAuth Exception]:', err);
      return { success: false, message: err?.message || 'Có lỗi xảy ra khi kết nối Google.' };
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
        loginWithGoogle,
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
