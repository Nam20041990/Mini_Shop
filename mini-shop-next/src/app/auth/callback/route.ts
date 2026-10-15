import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session?.user) {
      const user = data.session.user;
      const metadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      const userEmail = user.email ? user.email.toLowerCase().trim() : '';
      const isAdmin =
        metadata.role === 'admin' ||
        appMetadata.role === 'admin' ||
        ['trannamnb202@gmail.com', 'admin@minishop.com'].includes(userEmail);

      // Chuyển hướng người dùng vào /admin nếu là admin, hoặc trang chủ
      const destination = isAdmin ? '/admin' : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Nếu có lỗi, chuyển về trang login
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
