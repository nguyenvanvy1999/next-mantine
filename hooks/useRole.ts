'use client';

import { authClient } from '@/lib/auth-client';

/**
 * Hook to get the current user's role
 * @returns string | null - User's role or null if not authenticated
 */
export function useRole(): string | null {
  const { data: session } = authClient.useSession();
  return session?.user?.role ?? null;
}

/**
 * Hook to check if the current user has a specific role
 * @param role - Role name to check
 * @returns boolean - True if user has the role
 */
export function useHasRole(role: string): boolean {
  const userRole = useRole();

  if (!userRole) {
    return false;
  }

  // Support multiple roles separated by comma
  const roles = userRole.split(',').map((r) => r.trim());
  return roles.includes(role);
}

/**
 * Hook to check if the current user is an admin
 * @returns boolean - True if user has admin role
 */
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

/**
 * Hook to get all roles for the current user
 * @returns string[] - Array of role names
 */
export function useRoles(): string[] {
  const userRole = useRole();

  if (!userRole) {
    return [];
  }

  // Support multiple roles separated by comma
  return userRole.split(',').map((r) => r.trim());
}
