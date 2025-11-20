import type {
  ActionRes,
  DeleteManyDto,
  EventListResponse,
  EventResponse,
  ListEventsQuery,
  UpsertEventDto,
} from '@/types/event';
import { type ApiResponse, apiPost, useApiGet } from './api-utils';

const ENDPOINTS = {
  list: '/api/events',
  byId: (id: string) => `/api/events/${id}`,
  create: '/api/events',
  update: '/api/events',
  deleteMany: '/api/events/delete-many',
} as const;

interface NextApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export function useEvents(
  params?: ListEventsQuery,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options || {};

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.search) queryParams.search = params.search;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params?.startAtFrom) queryParams.startAtFrom = params.startAtFrom;
  if (params?.startAtTo) queryParams.startAtTo = params.startAtTo;
  if (params?.endAtFrom) queryParams.endAtFrom = params.endAtFrom;
  if (params?.endAtTo) queryParams.endAtTo = params.endAtTo;

  return useApiGet<EventListResponse>(ENDPOINTS.list, {
    params: queryParams,
    enabled,
  });
}

export function useEvent(id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useApiGet<EventResponse>(ENDPOINTS.byId(id), {
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

export async function createEvent(
  data: Omit<UpsertEventDto, 'id'>,
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

export async function updateEvent(
  data: UpsertEventDto,
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

export async function deleteManyEvents(
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
