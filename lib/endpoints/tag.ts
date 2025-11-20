import type {
  ActionRes,
  DeleteManyDto,
  ListTagsQuery,
  TagListResponse,
  TagResponse,
  UpsertTagDto,
} from '@/types/tag';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';

const ENDPOINTS = {
  list: '/api/tags',
  byId: (id: string) => `/api/tags/${id}`,
  create: '/api/tags',
  update: '/api/tags',
  deleteMany: '/api/tags/delete-many',
} as const;

interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export function useTags(
  params?: ListTagsQuery,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options || {};

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.search) queryParams.search = params.search;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  return useApiGet<TagListResponse>(ENDPOINTS.list, {
    params: queryParams,
    enabled,
  });
}

export function useTag(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useApiGet<TagResponse>(ENDPOINTS.byId(id), {
    enabled: enabled && !!id,
  });
}

function adaptResponse<T>(response: NextApiResponse<T>): ApiResponse<T> {
  return {
    succeeded: response.success,
    data: response.data,
    errors: response.success ? response.errors || [] : [response.message],
    message: response.message,
  };
}

export async function createTag(
  data: Omit<UpsertTagDto, 'id'>,
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

export async function updateTag(
  data: UpsertTagDto,
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

export async function deleteManyTags(
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
