'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

export type Permissions = Record<string, string[]>;
export type Role = 'user' | 'admin' | 'manager';

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

    checkPermission().then();
  }, [session, permissions]);

  return { hasPermission, isLoading };
}

export function useCheckRolePermission(
  role: Role,
  permissions: Permissions,
): boolean {
  try {
    return authClient.admin.checkRolePermission({
      role,
      permissions,
    });
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}
