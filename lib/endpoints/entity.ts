import type {
  ActionRes,
  DeleteManyDto,
  EntityListResponse,
  EntityResponse,
  ListEntitiesQuery,
  UpsertEntityDto,
} from '@/types/entity';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';

const ENDPOINTS = {
  list: '/api/entities',
  byId: (id: string) => `/api/entities/${id}`,
  create: '/api/entities',
  update: '/api/entities',
  deleteMany: '/api/entities/delete-many',
} as const;

interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

function unwrapNextApiResponse<T>(response: {
  data: ApiResponse<NextApiResponse<T>> | null;
}): T | undefined {
  if (response.data?.data?.data) {
    return response.data.data.data;
  }
  return undefined;
}

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

  const result = useApiGet<NextApiResponse<EntityListResponse>>(
    ENDPOINTS.list,
    {
      params: queryParams,
      enabled,
    },
  );

  const unwrappedData = unwrapNextApiResponse<EntityListResponse>(result);

  return {
    ...result,
    data: unwrappedData,
  } as typeof result & { data: EntityListResponse | undefined };
}

export function useEntity(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const result = useApiGet<NextApiResponse<EntityResponse>>(
    ENDPOINTS.byId(id),
    {
      enabled: enabled && !!id,
    },
  );

  const unwrappedData = unwrapNextApiResponse<EntityResponse>(result);

  return {
    ...result,
    data: unwrappedData,
  } as typeof result & { data: EntityResponse | undefined };
}

function adaptResponse<T>(response: NextApiResponse<T>): ApiResponse<T> {
  return {
    succeeded: response.success,
    data: response.data,
    errors: response.success ? response.errors || [] : [response.message],
    message: response.message,
  };
}

export async function createEntity(
  data: Omit<UpsertEntityDto, 'id'>,
): Promise<ApiResponse<ActionRes>> {
  const response = await apiPost<NextApiResponse<ActionRes>>(
    ENDPOINTS.create,
    data,
  );
  if (response.data?.data) {
    return adaptResponse(response.data);
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
    return adaptResponse(response.data);
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
    return adaptResponse(response.data);
  }
  return response;
}
