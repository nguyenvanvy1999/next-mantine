import { auth } from '@/lib/auth';
import type { User } from './instance';
import { permix } from './instance';
import { getTemplateByRole } from './templates';

/**
 * Setup Permix permissions for server-side usage
 * @param userId - User ID
 * @param role - User role
 */
export async function setupServerPermissions(userId: string, role: string) {
  const user: User = {
    id: userId,
    role,
  };

  const permissions = getTemplateByRole(role, user);
  permix.setup(permissions);
}

/**
 * Check permission on server side
 * @param userId - User ID
 * @param role - User role
 * @param resource - Resource name
 * @param action - Action name
 * @param data - Optional data for conditional permissions
 */
export async function checkServerPermission(
  userId: string,
  role: string,
  resource: string,
  action: string,
  data?: unknown,
): Promise<boolean> {
  await setupServerPermissions(userId, role);
  return permix.check(resource as any, action as any, data as any);
}

/**
 * Require permission on server side - throws error if permission denied
 * @param userId - User ID
 * @param role - User role
 * @param resource - Resource name
 * @param action - Action name
 * @param data - Optional data for conditional permissions
 */
export async function requireServerPermission(
  userId: string,
  role: string,
  resource: string,
  action: string,
  data?: unknown,
): Promise<void> {
  const hasPermission = await checkServerPermission(
    userId,
    role,
    resource,
    action,
    data,
  );

  if (!hasPermission) {
    throw new Error(`Permission denied: ${resource}.${action}`);
  }
}

/**
 * Get user session and check permission
 */
export async function checkPermissionWithSession(
  resource: string,
  action: string,
  data?: unknown,
): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  if (!session?.user) {
    return false;
  }

  return checkServerPermission(
    session.user.id,
    session.user.role || 'user',
    resource,
    action,
    data,
  );
}

/**
 * Require permission with session - redirects if not authenticated or throws if no permission
 */
export async function requirePermissionWithSession(
  resource: string,
  action: string,
  data?: unknown,
): Promise<void> {
  const { redirect } = await import('next/navigation');
  const { PATH_AUTH } = await import('@/routes');

  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  if (!session?.user) {
    redirect(PATH_AUTH.signin);
    return;
  }

  await requireServerPermission(
    session.user.id,
    session.user.role || 'user',
    resource,
    action,
    data,
  );
}
