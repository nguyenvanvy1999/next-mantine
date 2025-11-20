'use client';

import { usePermix } from './context';
import type {
  Analytics,
  Dashboard,
  Invoice,
  Order,
  Product,
  Project,
  Session,
  Setting,
  User,
} from './instance';

/**
 * Hook to check if user can perform an action on a resource
 * @param resource - Resource name (e.g., 'projects', 'orders')
 * @param action - Action name (e.g., 'create', 'view', 'update', 'delete')
 * @param data - Optional data object for conditional permissions
 * @returns boolean - True if user has permission
 */
export function useCan(
  resource: 'dashboard',
  action: 'view',
  data?: Dashboard,
): boolean;
export function useCan(
  resource: 'analytics',
  action: 'view' | 'export',
  data?: Analytics,
): boolean;
export function useCan(
  resource: 'projects',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Project,
): boolean;
export function useCan(
  resource: 'products',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Product,
): boolean;
export function useCan(
  resource: 'orders',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Order,
): boolean;
export function useCan(
  resource: 'invoices',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Invoice,
): boolean;
export function useCan(
  resource: 'settings',
  action: 'view' | 'update',
  data?: Setting,
): boolean;
export function useCan(
  resource: 'user',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: User,
): boolean;
export function useCan(
  resource: 'session',
  action: 'view' | 'delete',
  data?: Session,
): boolean;
export function useCan(
  resource: string,
  action: string,
  data?: unknown,
): boolean {
  const { check, isReady } = usePermix();

  if (!isReady) {
    return false;
  }

  return check(resource as any, action as any, data as any);
}

/**
 * Hook to check if user cannot perform an action (opposite of useCan)
 */
export function useCannot(
  resource: 'dashboard',
  action: 'view',
  data?: Dashboard,
): boolean;
export function useCannot(
  resource: 'analytics',
  action: 'view' | 'export',
  data?: Analytics,
): boolean;
export function useCannot(
  resource: 'projects',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Project,
): boolean;
export function useCannot(
  resource: 'products',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Product,
): boolean;
export function useCannot(
  resource: 'orders',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Order,
): boolean;
export function useCannot(
  resource: 'invoices',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: Invoice,
): boolean;
export function useCannot(
  resource: 'settings',
  action: 'view' | 'update',
  data?: Setting,
): boolean;
export function useCannot(
  resource: 'user',
  action: 'create' | 'view' | 'update' | 'delete',
  data?: User,
): boolean;
export function useCannot(
  resource: 'session',
  action: 'view' | 'delete',
  data?: Session,
): boolean;
export function useCannot(
  resource: string,
  action: string,
  data?: unknown,
): boolean {
  return !useCan(resource as any, action as any, data as any);
}

/**
 * Hook to check if permissions are ready
 */
export function usePermissionsReady(): boolean {
  const { isReady } = usePermix();
  return isReady;
}
