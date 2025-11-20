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

type ErrorPayload = {
  message?: string;
  errors?: string[];
};

type ApiRequestError = Error & {
  status?: number;
  details?: unknown;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function extractErrorMessage(
  payload: unknown,
  fallback: string,
): { message: string; details?: unknown } {
  if (payload && typeof payload === 'object') {
    const { message, errors } = payload as ErrorPayload;
    if (message) {
      return { message, details: payload };
    }

    if (Array.isArray(errors) && errors.length > 0) {
      return { message: errors.join(', '), details: payload };
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return { message: payload.trim(), details: payload };
  }

  return { message: fallback, details: payload };
}

async function handleApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  const fallbackMessage = `HTTP ${response.status}: ${
    response.statusText || 'Unknown error'
  }`;
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const { message, details } = extractErrorMessage(payload, fallbackMessage);
    const error: ApiRequestError = new Error(message);
    error.status = response.status;
    error.details = details;
    throw error;
  }

  return payload as ApiResponse<T>;
}

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

  const result = useFetch<T>(shouldFetch ? url.toString() : '', {
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

    return handleApiResponse<T>(response);
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

    return handleApiResponse<T>(response);
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

    return handleApiResponse<T>(response);
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
