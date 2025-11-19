'use client';

import { Alert, Loader } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { type Permissions, usePermission } from '@/hooks/usePermission';

interface PermissionGateProps {
  /**
   * Permissions required to view the children
   */
  permissions: Permissions;
  /**
   * Content to render when user has permission
   */
  children: ReactNode;
  /**
   * Optional fallback content when user doesn't have permission
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode;
  /**
   * Optional loading content while checking permissions
   * If not provided, a default loader will be shown
   */
  loadingFallback?: ReactNode;
  /**
   * If true, show a default "Access Denied" message when permission is denied
   * Only used if fallback is not provided
   */
  showDefaultDenied?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * ```tsx
 * <PermissionGate permissions={{ projects: ['create'] }}>
 *   <Button>Create Project</Button>
 * </PermissionGate>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <PermissionGate
 *   permissions={{ projects: ['delete'] }}
 *   fallback={<Text c="dimmed">You don't have permission to delete</Text>}
 * >
 *   <Button color="red">Delete Project</Button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permissions,
  children,
  fallback,
  loadingFallback,
  showDefaultDenied = false,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermission(permissions);

  if (isLoading) {
    return loadingFallback ?? <Loader size="sm" />;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showDefaultDenied) {
      return (
        <Alert icon={<IconLock size={16} />} title="Access Denied" color="red">
          You don't have permission to access this content.
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}
