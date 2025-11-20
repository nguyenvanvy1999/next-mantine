import type {
  ActionRes,
  DeleteManyDto,
  EntityListResponse,
  EntityResponse,
  ListEntitiesQuery,
  UpsertEntityDto,
} from '@/types/entity';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';
import { adaptNextResponse, type NextApiResponse } from './types';

const ENDPOINTS = {
  list: '/api/entities',
  byId: (id: string) => `/api/entities/${id}`,
  create: '/api/entities',
  update: '/api/entities',
  deleteMany: '/api/entities/delete-many',
} as const;

export function useEntities(
  params?: ListEntitiesQuery,
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
    queryParams.type = params.type.join(',');
  }

  return useApiGet<EntityListResponse>(ENDPOINTS.list, {
    params: queryParams,
    enabled,
  });
}

export function useEntity(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useApiGet<EntityResponse>(ENDPOINTS.byId(id), {
    enabled: enabled && !!id,
  });
}

export async function createEntity(
  data: Omit<UpsertEntityDto, 'id'>,
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

export async function updateEntity(
  data: UpsertEntityDto,
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

export async function deleteManyEntities(
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
