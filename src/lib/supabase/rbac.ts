// Label Ledger — Role-Based Access Control (RBAC) & Route Protection Helpers
// Evaluates server-side user authentication and profile.role against permission requirements.

import { redirect } from 'next/navigation';
import { getCurrentUser } from './auth';
import { getCurrentUserRole, UserRole } from './profiles';

export interface AuthorizationResult {
  userId: string;
  role: UserRole;
}

export const PERMISSION_MATRIX: Record<UserRole, string[]> = {
  admin: [
    '/dashboard/LabelGuard/scan',
    '/dashboard/LabelGuard/dashboard',
    '/dashboard/LabelGuard/repository',
    '/dashboard/LabelGuard/review',
    '/dashboard/LabelGuard/report',
  ],
  inspector: [
    '/dashboard/LabelGuard/scan',
    '/dashboard/LabelGuard/dashboard',
    '/dashboard/LabelGuard/repository',
    '/dashboard/LabelGuard/review',
    '/dashboard/LabelGuard/report',
  ],
  manufacturer: [
    '/dashboard/LabelGuard/dashboard',
    '/dashboard/LabelGuard/repository',
    '/dashboard/LabelGuard/report',
  ],
  viewer: [
    '/dashboard/LabelGuard/dashboard',
    '/dashboard/LabelGuard/repository',
    '/dashboard/LabelGuard/report',
  ],
};

/**
 * Ensures user is authenticated.
 * If not authenticated -> redirects to login page.
 */
export async function requireAuth(
  redirectToLogin = '/dashboard/LabelGuard/login'
): Promise<string> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect(redirectToLogin);
  }
  return user.id;
}

/**
 * Server-side route guard enforcing authentication and role authorization.
 * 1. Checks if user is authenticated -> if not, redirects to login page.
 * 2. Queries public.profiles.role server-side.
 * 3. Checks if user's role is in allowedRoles -> if not, redirects to unauthorized page.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectToLogin = '/dashboard/LabelGuard/login',
  redirectToUnauthorized = '/dashboard/LabelGuard/unauthorized'
): Promise<AuthorizationResult> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect(redirectToLogin);
  }

  // Server-side authoritative role lookup
  const role = (await getCurrentUserRole()) || 'inspector';

  if (!allowedRoles.includes(role)) {
    redirect(redirectToUnauthorized);
  }

  return {
    userId: user.id,
    role,
  };
}

/**
 * Utility function to verify if a role has access to a given route path.
 */
export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const allowedRoutes = PERMISSION_MATRIX[role] || [];
  return allowedRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
}
