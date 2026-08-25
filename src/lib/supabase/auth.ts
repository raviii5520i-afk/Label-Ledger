// Label Ledger — Supabase Authentication Helpers
// Provides signIn, signUp, signOut, resetPasswordForEmail, updatePassword, getCurrentUser, and getCurrentSession.

import { createClient as createBrowserClient } from './client';
import type { User, Session } from '@supabase/supabase-js';

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  email: string;
  password?: string;
  fullName?: string;
  role?: 'inspector' | 'admin' | 'manufacturer' | 'viewer';
}

export interface AuthStateResult {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Signs in a user using email and password.
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthStateResult> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password || '',
    });

    return {
      user: data.user,
      session: data.session,
      error: error ? new Error(error.message) : null,
    };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Signs up a new user with email, password, and optional profile metadata (fullName, role).
 * Note: New signups are strictly defaulted to 'inspector' role unless created by an admin.
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthStateResult> {
  try {
    const supabase = createBrowserClient();
    const assignedRole = credentials.role === 'admin' ? 'inspector' : (credentials.role || 'inspector');

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password || '',
      options: {
        data: {
          full_name: credentials.fullName?.trim() || '',
          role: assignedRole,
        },
      },
    });

    return {
      user: data.user,
      session: data.session,
      error: error ? new Error(error.message) : null,
    };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Sends a password recovery email to the user with a dynamic redirect URL.
 */
export async function resetPasswordForEmail(
  email: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createBrowserClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = redirectTo || `${origin}/auth/callback?next=/dashboard/LabelGuard/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl,
    });

    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Updates the authenticated user's password (used during password recovery reset flow).
 */
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Signs out the current user and clears active session.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieves the current authenticated user from Supabase.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current active session from Supabase.
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
