// Label Ledger — Supabase Server Client Initialization
// Uses @supabase/ssr createServerClient with Next.js cookie store for Server Components & Actions.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getSupabaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  if (!url || url === 'undefined' || url === 'null') {
    return 'https://placeholder.supabase.co';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!key || key === 'undefined' || key === 'null') {
    return 'placeholder-key';
  }
  return key;
}

export const SUPABASE_URL = getSupabaseUrl();
export const SUPABASE_ANON_KEY = getSupabaseAnonKey();

/**
 * Creates a server-side Supabase instance.
 * Safe for use in Server Components, Server Actions, and Route Handlers.
 */
export async function createClient() {
  const cookieStore = cookies();
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignored from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignored from Server Component
          }
        },
      },
    },
  );
}
