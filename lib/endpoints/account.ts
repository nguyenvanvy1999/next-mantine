import type {
  AccountListResponse,
  AccountResponse,
  ActionRes,
  DeleteManyDto,
  UpsertAccountDto,
} from '@/types/account';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';

// Endpoints - Next.js API routes
const ENDPOINTS = {
  list: '/api/accounts',
  byId: (id: string) => `/api/accounts/${id}`,
  create: '/api/accounts',
  update: '/api/accounts', // Uses POST for upsert
  deleteMany: '/api/accounts/delete-many',
} as const;

// Query parameters for list accounts
export interface ListAccountsParams {
  type?: string[];
  currencyId?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created' | 'balance';
  sortOrder?: 'asc' | 'desc';
}

// Next.js API response wrapper
interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

// Helper to unwrap Next.js API response
// useApiGet returns { data: ApiResponse<T> | null, ... }
// Next.js API returns { success, message, data: T }
// We need to extract the inner data
function unwrapNextApiResponse<T>(response: {
  data: ApiResponse<NextApiResponse<T>> | null;
}): T | undefined {
  if (response.data?.data?.data) {
    return response.data.data.data;
  }
  return undefined;
}

// Hooks
export function useAccounts(
  params?: ListAccountsParams,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options || {};

  // Build query params - handle arrays properly for investment backend
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.search) queryParams.search = params.search;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params?.type && params.type.length > 0) {
    params.type.forEach((t) => {
      queryParams[`type[]`] = t;
    });
  }
  if (params?.currencyId && params.currencyId.length > 0) {
    params.currencyId.forEach((c) => {
      queryParams[`currencyId[]`] = c;
    });
  }

  const result = useApiGet<NextApiResponse<AccountListResponse>>(
    ENDPOINTS.list,
    {
      params: queryParams,
      enabled,
    },
  );

  // useApiGet returns ApiResponse<NextApiResponse<AccountListResponse>>
  // Next.js API returns { success, message, data: AccountListResponse }
  // We need to unwrap to get AccountListResponse
  const unwrappedData = unwrapNextApiResponse<AccountListResponse>(result);

  return {
    ...result,
    data: unwrappedData,
  } as typeof result & { data: AccountListResponse | undefined };
}

export function useAccount(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const result = useApiGet<NextApiResponse<AccountResponse>>(
    ENDPOINTS.byId(id),
    {
      enabled: enabled && !!id,
    },
  );

  // useApiGet returns ApiResponse<NextApiResponse<AccountResponse>>
  // Next.js API returns { success, message, data: AccountResponse }
  // We need to unwrap to get AccountResponse
  const unwrappedData = unwrapNextApiResponse<AccountResponse>(result);

  return {
    ...result,
    data: unwrappedData,
  } as typeof result & { data: AccountResponse | undefined };
}

// Helper to convert Next.js API response to next-mantine format
function adaptResponse<T>(response: NextApiResponse<T>): ApiResponse<T> {
  return {
    succeeded: response.success,
    data: response.data,
    errors: response.success ? response.errors || [] : [response.message],
    message: response.message,
  };
}

// Mutations
export async function createAccount(
  data: Omit<UpsertAccountDto, 'id'>,
): Promise<ApiResponse<ActionRes>> {
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.create,
    data,
  );
  // apiPost returns ApiResponse<NextApiResponse<T>>, unwrap it
  if (response.data?.data) {
    return adaptResponse(response.data);
  }
  return response;
}

export async function updateAccount(
  data: UpsertAccountDto,
): Promise<ApiResponse<ActionRes>> {
  // Uses POST for upsert (includes id in body)
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.update,
    data,
  );
  // apiPost returns ApiResponse<NextApiResponse<T>>, unwrap it
  if (response.data?.data) {
    return adaptResponse(response.data);
  }
  return response;
}

export async function deleteManyAccounts(
  ids: string[],
): Promise<ApiResponse<ActionRes>> {
  const body: DeleteManyDto = { ids };
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.deleteMany,
    body,
  );
  // apiPost returns ApiResponse<NextApiResponse<T>>, unwrap it
  if (response.data?.data) {
    return adaptResponse(response.data);
  }
  return response;
}

// Combined hook with mutations for convenience
export function useAccountsWithMutations() {
  const accountsQuery = useAccounts();

  const mutations = {
    create: async (data: Omit<UpsertAccountDto, 'id'>) => {
      const result = await createAccount(data);
      accountsQuery.refetch(); // Refresh the list
      return result;
    },

    update: async (data: UpsertAccountDto) => {
      const result = await updateAccount(data);
      accountsQuery.refetch(); // Refresh the list
      return result;
    },

    deleteMany: async (ids: string[]) => {
      const result = await deleteManyAccounts(ids);
      accountsQuery.refetch(); // Refresh the list
      return result;
    },
  };

  return {
    ...accountsQuery,
    mutations,
  };
}
