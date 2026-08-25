// Label Ledger — Supabase Browser Client Initialization
// Uses @supabase/ssr createBrowserClient for App Router compatibility.

import { createBrowserClient } from '@supabase/ssr';

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
 * Creates a client-side Supabase instance.
 * Safe for use in Client Components ('use client').
 */
export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return createBrowserClient(url, key);
}
