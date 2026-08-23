// Label Ledger — Profile & Role Service Helpers
// Safe resolution of public.profiles records and user roles.

import { createClient as createBrowserClient } from './client';
import { getCurrentUser } from './auth';

export type UserRole = 'admin' | 'inspector' | 'manufacturer' | 'viewer';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the public.profiles record for the currently authenticated user.
 * Resolves user via getCurrentUser() and queries profiles where profiles.id = user.id.
 * Safe against missing users, non-existent profiles, and database query errors.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return null;
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      full_name: data.full_name || '',
      email: data.email || user.email || '',
      role: (data.role as UserRole) || 'inspector',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  } catch (err: unknown) {
    console.error('[getCurrentProfile] Exception during profile query:', err);
    return null;
  }
}

/**
 * Fetches the public.profiles.role for the currently authenticated user directly from the database.
 * Does NOT rely on or trust frontend-supplied role parameters.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const profile = await getCurrentProfile();
    return profile?.role ?? null;
  } catch (err: unknown) {
    console.error('[getCurrentUserRole] Exception during role query:', err);
    return null;
  }
}
