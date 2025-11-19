'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

/**
 * Permission type definition
 * Example: { projects: ['create', 'view'], products: ['view'] }
 */
export type Permissions = Record<string, string[]>;

/**
 * Hook to check if the current user has specific permissions
 * @param permissions - Permissions object to check
 * @returns { hasPermission: boolean, isLoading: boolean }
 */
export function usePermission(permissions: Permissions) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function checkPermission() {
      if (!session?.user) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await authClient.admin.hasPermission({
          userId: session.user.id,
          permissions,
        });

        setHasPermission(result?.data?.success ?? false);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkPermission();
  }, [session, permissions]);

  return { hasPermission, isLoading };
}

/**
 * Hook to check if a specific role has permissions (client-side check without API call)
 * This is synchronous and checks against the role definitions
 * @param role - Role name to check
 * @param permissions - Permissions object to check
 * @returns boolean - True if role has the permissions
 */
export function useCheckRolePermission(
  role: string,
  permissions: Permissions,
): boolean {
  try {
    return authClient.admin.checkRolePermission({
      role: role as any, // Better Auth has strict role types
      permissions,
    });
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}
