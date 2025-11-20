import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { checkServerPermission } from '@/lib/permix/server';
import { PATH_AUTH } from '@/routes';

/**
 * Permission type definition
 * Example: { projects: ['create', 'view'], products: ['view'] }
 */
export type Permissions = Record<string, string[]>;

/**
 * Check if a user has specific permissions using Permix
 * @param userId - User ID to check permissions for
 * @param permissions - Permissions object to check
 * @returns Promise<boolean> - True if user has all required permissions
 */
export async function checkPermission(
  userId: string,
  permissions: Permissions,
): Promise<boolean> {
  try {
    // Get user role
    const userRole = await getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Check each permission using Permix
    const permissionChecks = Object.entries(permissions).flatMap(
      ([resource, actions]) =>
        actions.map((action) =>
          checkServerPermission(userId, userRole, resource, action),
        ),
    );

    const results = await Promise.all(permissionChecks);
    return results.every((result) => result === true);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a role has specific permissions (without user context) using Permix
 * @param role - Role name to check
 * @param permissions - Permissions object to check
 * @returns Promise<boolean> - True if role has all required permissions
 */
export async function checkRolePermission(
  role: string,
  permissions: Permissions,
): Promise<boolean> {
  try {
    // Use a dummy user ID for role-based checks
    const dummyUserId = 'role-check';

    // Check each permission using Permix
    const permissionChecks = Object.entries(permissions).flatMap(
      ([resource, actions]) =>
        actions.map((action) =>
          checkServerPermission(dummyUserId, role, resource, action),
        ),
    );

    const results = await Promise.all(permissionChecks);
    return results.every((result) => result === true);
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}

/**
 * Require specific permissions for a page/action
 * Redirects to unauthorized page if user doesn't have permission
 * @param permissions - Permissions object required
 * @param redirectTo - Optional custom redirect path (defaults to sign-in)
 */
export async function requirePermission(
  permissions: Permissions,
  redirectTo?: string,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  if (!session?.user) {
    redirect(PATH_AUTH.signin);
  }

  const hasPermission = await checkPermission(session.user.id, permissions);

  if (!hasPermission) {
    redirect(redirectTo || '/unauthorized');
  }
}

/**
 * Get user's current role(s)
 * @param userId - User ID
 * @returns Promise<string | null> - User's role or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    // Query the user from the database directly using prisma
    const { prisma } = await import('@/lib/auth');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role ?? null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user has a specific role
 * @param userId - User ID
 * @param role - Role name to check
 * @returns Promise<boolean> - True if user has the role
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const userRole = await getUserRole(userId);

  if (!userRole) {
    return false;
  }

  // Support multiple roles separated by comma
  const roles = userRole.split(',').map((r) => r.trim());
  return roles.includes(role);
}

/**
 * Require a specific role for a page/action
 * Redirects to unauthorized page if user doesn't have the role
 * @param role - Role name required
 * @param redirectTo - Optional custom redirect path (defaults to sign-in)
 */
export async function requireRole(
  role: string,
  redirectTo?: string,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  if (!session?.user) {
    redirect(PATH_AUTH.signin);
  }

  const userHasRole = await hasRole(session.user.id, role);

  if (!userHasRole) {
    redirect(redirectTo || '/unauthorized');
  }
}
