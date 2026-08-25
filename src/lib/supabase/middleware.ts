// Label Ledger — Supabase Middleware Session Refresh Handler
// Refreshes expired authentication tokens and updates cookies safely for Vercel Edge Runtime.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip session refresh if Supabase credentials are not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              request.cookies.set({ name, value, ...options });
            } catch {
              // Edge Runtime request.cookies is immutable
            }
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            try {
              supabaseResponse.cookies.set({ name, value, ...options });
            } catch {
              // Fallback for cookie setting
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              request.cookies.set({ name, value: '', ...options });
            } catch {
              // Edge Runtime request.cookies is immutable
            }
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            try {
              supabaseResponse.cookies.set({ name, value: '', ...options });
            } catch {
              // Fallback for cookie removal
            }
          },
        },
      },
    );

    // Refresh the auth token safely
    await supabase.auth.getUser();
  } catch (err) {
    console.warn('[Supabase Middleware Session Refresh Exception]', err);
  }

  return supabaseResponse;
}
