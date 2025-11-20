import type {
  AccountListResponse,
  AccountResponse,
  ActionRes,
  DeleteManyDto,
  UpsertAccountDto,
} from '@/types/account';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';
import { adaptNextResponse, type NextApiResponse } from './types';

const ENDPOINTS = {
  list: '/api/accounts',
  byId: (id: string) => `/api/accounts/${id}`,
  create: '/api/accounts',
  update: '/api/accounts',
  deleteMany: '/api/accounts/delete-many',
} as const;

export interface ListAccountsParams {
  type?: string[];
  currencyId?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created' | 'balance';
  sortOrder?: 'asc' | 'desc';
}

export function useAccounts(
  params?: ListAccountsParams,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options || {};

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

  return useApiGet<AccountListResponse>(ENDPOINTS.list, {
    params: queryParams,
    enabled,
  });
}

export function useAccount(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useApiGet<AccountResponse>(ENDPOINTS.byId(id), {
    enabled: enabled && !!id,
  });
}

export async function createAccount(
  data: Omit<UpsertAccountDto, 'id'>,
): Promise<ApiResponse<ActionRes>> {
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.create,
    data,
  );
  if (response.data?.data) {
    return adaptNextResponse(response.data);
  }
  return response;
}

export async function updateAccount(
  data: UpsertAccountDto,
): Promise<ApiResponse<ActionRes>> {
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.update,
    data,
  );
  if (response.data?.data) {
    return adaptNextResponse(response.data);
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
  if (response.data?.data) {
    return adaptNextResponse(response.data);
  }
  return response;
}

export function useAccountsWithMutations() {
  const accountsQuery = useAccounts();

  const mutations = {
    create: async (data: Omit<UpsertAccountDto, 'id'>) => {
      const result = await createAccount(data);
      accountsQuery.refetch();
      return result;
    },

    update: async (data: UpsertAccountDto) => {
      const result = await updateAccount(data);
      accountsQuery.refetch();
      return result;
    },

    deleteMany: async (ids: string[]) => {
      const result = await deleteManyAccounts(ids);
      accountsQuery.refetch();
      return result;
    },
  };

  return {
    ...accountsQuery,
    mutations,
  };
}
