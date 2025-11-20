'use client';

import { Alert, Loader, Text } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import type React from 'react';
import { useCan, usePermissionsReady } from './hooks';

interface PermissionGateProps {
  resource:
    | 'dashboard'
    | 'analytics'
    | 'projects'
    | 'products'
    | 'orders'
    | 'invoices'
    | 'settings'
    | 'user'
    | 'session';
  action: string;
  data?: unknown;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  loadingFallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on Permix permissions
 *
 * @example
 * ```tsx
 * <PermissionGate resource="projects" action="create">
 *   <CreateProjectButton />
 * </PermissionGate>
 * ```
 *
 * @example With conditional permission
 * ```tsx
 * <PermissionGate
 *   resource="projects"
 *   action="update"
 *   data={project}
 * >
 *   <EditProjectButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  resource,
  action,
  data,
  children,
  fallback,
  showFallback = false,
  loadingFallback,
}: PermissionGateProps) {
  const isReady = usePermissionsReady();
  const canAccess = useCan(resource as any, action as any, data as any);

  if (!isReady) {
    return loadingFallback ? loadingFallback : <Loader size="sm" />;
  }

  if (canAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  if (showFallback) {
    return (
      <Alert icon={<IconLock size={16} />} color="yellow" variant="light">
        <Text size="sm">
          You don&apos;t have permission to access this feature.
        </Text>
      </Alert>
    );
  }

  return null;
}

interface MultiPermissionGateProps {
  permissions: Array<{
    resource:
      | 'dashboard'
      | 'analytics'
      | 'projects'
      | 'products'
      | 'orders'
      | 'invoices'
      | 'settings'
      | 'user'
      | 'session';
    action: string;
    data?: unknown;
  }>;
  mode?: 'any' | 'all';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  loadingFallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on multiple Permix permissions
 *
 * @example
 * ```tsx
 * <MultiPermissionGate
 *   permissions={[
 *     { resource: 'projects', action: 'create' },
 *     { resource: 'orders', action: 'create' }
 *   ]}
 *   mode="any"
 * >
 *   <CreateButton />
 * </MultiPermissionGate>
 * ```
 */
export function MultiPermissionGate({
  permissions,
  mode = 'any',
  children,
  fallback,
  showFallback = false,
  loadingFallback,
}: MultiPermissionGateProps) {
  const isReady = usePermissionsReady();
  const checks = permissions.map(({ resource, action, data }) =>
    useCan(resource as any, action as any, data as any),
  );

  if (!isReady) {
    return loadingFallback ? loadingFallback : <Loader size="sm" />;
  }

  const hasAccess =
    mode === 'any'
      ? checks.some((check) => check)
      : checks.every((check) => check);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  if (showFallback) {
    return (
      <Alert icon={<IconLock size={16} />} color="yellow" variant="light">
        <Text size="sm">
          You don&apos;t have the required permissions to access this feature.
        </Text>
      </Alert>
    );
  }

  return null;
}

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  loadingFallback?: React.ReactNode;
}

/**
 * Component that only renders for admin users
 *
 * @example
 * ```tsx
 * <AdminOnly>
 *   <UserManagementPanel />
 * </AdminOnly>
 * ```
 */
export function AdminOnly({
  children,
  fallback,
  showFallback = false,
  loadingFallback,
}: AdminOnlyProps) {
  return (
    <MultiPermissionGate
      permissions={[
        { resource: 'user', action: 'create' },
        { resource: 'user', action: 'delete' },
      ]}
      mode="any"
      fallback={fallback}
      showFallback={showFallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </MultiPermissionGate>
  );
}
