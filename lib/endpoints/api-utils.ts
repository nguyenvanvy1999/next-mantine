import { useFetch } from '@mantine/hooks';
import { authClient } from '@/lib/auth-client';

function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string,
): boolean {
  if (!userPermissions || !requiredPermission) return false;
  return userPermissions.includes(requiredPermission);
}

const API_BASE_URL = '';

export type ApiResponse<T> = {
  succeeded: boolean;
  data: T;
  errors: string[];
  message: string;
};

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

export function useApiGet<T>(
  endpoint: string,
  options?: {
    params?: Record<string, string | number | boolean | undefined>;
    enabled?: boolean;
    permission?: string;
  },
) {
  const { params, enabled = true, permission } = options || {};
  const { data: session } = authClient.useSession();

  let url: URL;
  if (API_BASE_URL) {
    url = new URL(endpoint, API_BASE_URL);
  } else if (typeof window !== 'undefined') {
    url = new URL(endpoint, window.location.origin);
  } else {
    url = new URL(endpoint, 'http://localhost:3000');
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  type UserWithPermissions = { permissions?: string[] };
  const userPermissions =
    (session?.user as UserWithPermissions)?.permissions || [];
  const accessToken = session?.session?.token;

  const hasRequiredPermission = permission
    ? hasPermission(userPermissions, permission)
    : true;

  const shouldFetch = enabled && !!accessToken && hasRequiredPermission;

  const result = useFetch<ApiResponse<T>>(shouldFetch ? url.toString() : '', {
    headers: getAuthHeaders(accessToken),
  });

  return {
    ...result,
    hasPermission: hasRequiredPermission,
    permissionDenied: !hasRequiredPermission && !!permission,
  };
}

interface SessionResponse {
  session?: { token?: string };
  user?: { permissions?: string[] };
}

async function getCurrentTokenAndPermissions(): Promise<{
  token: string | null;
  permissions: string[] | undefined;
}> {
  if (typeof window === 'undefined')
    return { token: null, permissions: undefined };

  try {
    const sessionData = await authClient.$fetch<SessionResponse>('/session');
    const data = 'data' in sessionData ? sessionData.data : sessionData;

    return {
      token: (data as SessionResponse)?.session?.token || null,
      permissions: (data as SessionResponse)?.user?.permissions,
    };
  } catch {
    return { token: null, permissions: undefined };
  }
}

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

export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
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

export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
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

export function usePermission(requiredPermission: string) {
  const { data: session, isPending } = authClient.useSession();
  type UserWithPermissions = { permissions?: string[] };
  const userPermissions =
    (session?.user as UserWithPermissions)?.permissions || [];

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
