// Label Ledger — Supabase Authentication Helpers
// Provides signIn, signUp, signOut, getCurrentUser, and getCurrentSession.

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
  role?: 'inspector' | 'admin';
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
      email: credentials.email,
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
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthStateResult> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password || '',
      options: {
        data: {
          full_name: credentials.fullName || '',
          role: credentials.role || 'inspector',
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
