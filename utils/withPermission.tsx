import type { ComponentType } from 'react';
import { type Permissions, requirePermission } from '@/lib/permissions';

interface WithPermissionOptions {
  /**
   * Permissions required to access the page
   */
  permissions: Permissions;
  /**
   * Optional custom redirect path when permission is denied
   * Defaults to '/unauthorized'
   */
  redirectTo?: string;
}

/**
 * Higher-Order Component that protects a page with permission checks
 *
 * @example
 * ```tsx
 * const ProtectedPage = withPermission(MyPage, {
 *   permissions: { projects: ['create', 'update'] }
 * });
 *
 * export default ProtectedPage;
 * ```
 *
 * @param Component - The page component to protect
 * @param options - Permission configuration
 * @returns Protected page component
 */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  options: WithPermissionOptions,
) {
  return async function ProtectedPage(props: P) {
    // Check permissions on the server side
    await requirePermission(options.permissions, options.redirectTo);

    // If we get here, user has permission
    return <Component {...props} />;
  };
}
