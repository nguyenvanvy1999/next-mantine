'use client';

import { useRouter } from 'next/navigation';
import type { components } from '@/lib/api';
import {
  clearUserPermissions,
  type Permission,
  usePermissions,
} from '@/lib/api/permissions';
import { authClient } from '@/lib/auth-client';
import { PATH_AUTH } from '@/routes';

// Type aliases for compatibility
type LoginDto = components['schemas']['LoginDto'];
type RegisterDto = components['schemas']['RegisterDto'];
type UserProfileDto = components['schemas']['UserProfileDto'];

export const useAuth = () => {
  const { data: session, isPending } = authClient.useSession();
  const userPermissions = usePermissions();
  const router = useRouter();

  const isAuthenticated = !!session?.user;
  const isLoading = isPending;

  // Logout using Better Auth
  const logout = async () => {
    try {
      // Clear permissions
      clearUserPermissions();

      // Better Auth logout
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push(PATH_AUTH.signin);
          },
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Ensure cleanup happens even on error
      clearUserPermissions();
      router.push(PATH_AUTH.signin);
    }
  };

  // Login using Better Auth
  const login = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: () => {
            router.push('/dashboard');
          },
          onError: (ctx) => {
            console.error('Login error:', ctx.error);
          },
        },
      });

      return !!result.data;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Permission helpers - use Better Auth session permissions
  const hasPermission = (permission: Permission): boolean => {
    // Try userPermissions first, then session permissions
    const permissions =
      userPermissions?.permissions || (session?.user as any)?.permissions || [];
    return permissions.includes(permission);
  };

  // Extract user data from Better Auth session
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }
    : undefined;

  // Extract permissions and roles from user
  const permissions =
    userPermissions?.permissions || (session?.user as any)?.permissions || [];
  const roles = userPermissions?.role
    ? [userPermissions.role]
    : (session?.user as any)?.roles || [];

  return {
    // User info from Better Auth session
    user,

    // Permissions from RBAC system or session
    permissions,
    roles,
    userPermissions,
    hasPermission,

    // Auth state
    isAuthenticated,
    isLoading,

    // Auth actions
    login,
    logout,

    // Token access (Better Auth uses session tokens internally)
    accessToken: session?.session?.token,
  };
};
