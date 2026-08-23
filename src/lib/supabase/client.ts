// Label Ledger — Supabase Browser Client Initialization
// Uses @supabase/ssr createBrowserClient for App Router compatibility.

import { createBrowserClient } from '@supabase/ssr';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a client-side Supabase instance.
 * Safe for use in Client Components ('use client').
 */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[LabelLedger] Supabase environment variables missing. Operating in Mock Data mode.',
      );
    }
  }

  return createBrowserClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY || 'placeholder-key',
  );
}
