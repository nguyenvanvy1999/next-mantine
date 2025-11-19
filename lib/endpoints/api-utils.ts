import { useFetch } from '@mantine/hooks';
import type { components } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

// Simple permission checking helper
function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string,
): boolean {
  if (!userPermissions || !requiredPermission) return false;
  return userPermissions.includes(requiredPermission);
}

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';

// Standard API response type
export type ApiResponse<T> = {
  succeeded: boolean;
  data: T;
  errors: string[];
  message: string;
};

// Get auth headers helper using Better Auth session
export function getAuthHeaders(
  accessToken: string | undefined | null,
): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

// Simple GET hook with Better Auth and RBAC
export function useApiGet<T>(
  endpoint: string,
  options?: {
    params?: Record<string, any>;
    enabled?: boolean;
    permission?: string;
  },
) {
  const { params, enabled = true, permission } = options || {};
  const { data: session } = authClient.useSession();

  // Build URL with query params
  const url = new URL(endpoint, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Get permissions from user
  const userPermissions = (session?.user as any)?.permissions || [];
  const accessToken = session?.session?.token;

  // Check permissions if specified
  const hasRequiredPermission = permission
    ? hasPermission(userPermissions, permission)
    : true;

  // Only make request if we have a session, it's enabled, and permissions allow
  const shouldFetch = enabled && !!accessToken && hasRequiredPermission;

  const result = useFetch<ApiResponse<T>>(shouldFetch ? url.toString() : '', {
    headers: getAuthHeaders(accessToken),
  });

  // Add permission info to the result
  return {
    ...result,
    hasPermission: hasRequiredPermission,
    permissionDenied: !hasRequiredPermission && !!permission,
  };
}

// Helper to get current session token and check permissions (for mutations)
async function getCurrentTokenAndPermissions(): Promise<{
  token: string | null;
  permissions: string[] | undefined;
}> {
  if (typeof window === 'undefined')
    return { token: null, permissions: undefined };

  // Get session from Better Auth
  try {
    const sessionData: any = await authClient.$fetch('/session');

    return {
      token: sessionData?.session?.token || null,
      permissions: sessionData?.user?.permissions,
    };
  } catch (error) {
    return { token: null, permissions: undefined };
  }
}

// Permission-aware mutation wrapper
async function withPermissionCheck<T>(
  operation: () => Promise<ApiResponse<T>>,
  requiredPermission?: string,
): Promise<ApiResponse<T>> {
  if (!requiredPermission) {
    return operation();
  }

  const { permissions } = await getCurrentTokenAndPermissions();

  if (!hasPermission(permissions, requiredPermission)) {
    throw new Error(`Permission denied. Required: ${requiredPermission}`);
  }

  return operation();
}

// Simple POST function with NextAuth and optional permission check
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  options?: { permission?: string },
): Promise<ApiResponse<T>> {
  return withPermissionCheck(async () => {
    const { token } = await getCurrentTokenAndPermissions();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, options?.permission);
}

// Simple PUT function with NextAuth and optional permission check
export async function apiPut<T>(
  endpoint: string,
  data?: any,
  options?: { permission?: string },
): Promise<ApiResponse<T>> {
  return withPermissionCheck(async () => {
    const { token } = await getCurrentTokenAndPermissions();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, options?.permission);
}

// Simple DELETE function with NextAuth and optional permission check
export async function apiDelete<T>(
  endpoint: string,
  options?: { permission?: string },
): Promise<ApiResponse<T>> {
  return withPermissionCheck(async () => {
    const { token } = await getCurrentTokenAndPermissions();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, options?.permission);
}

// Simple permission hook for components
export function usePermission(requiredPermission: string) {
  const { data: session, isPending } = authClient.useSession();
  const userPermissions = (session?.user as any)?.permissions || [];

  const hasRequiredPermission = hasPermission(
    userPermissions,
    requiredPermission,
  );

  return {
    hasPermission: hasRequiredPermission,
    loading: isPending,
    permissions: userPermissions,
  };
}

// Re-export types for convenience
export type { components };
