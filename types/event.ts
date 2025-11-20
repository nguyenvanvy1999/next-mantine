export interface EventResponse {
  id: string;
  name: string;
  startAt: string; // ISO date string
  endAt: string | null; // ISO date string
  created: string; // ISO date string
  modified: string; // ISO date string
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventListResponse {
  events: EventResponse[];
  pagination: PaginationMeta;
}

export interface UpsertEventDto {
  id?: string;
  name: string;
  startAt: string; // ISO datetime string
  endAt?: string; // ISO datetime string
}

export interface ListEventsQuery {
  search?: string;
  startAtFrom?: string; // ISO datetime string
  startAtTo?: string; // ISO datetime string
  endAtFrom?: string; // ISO datetime string
  endAtTo?: string; // ISO datetime string
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'startAt' | 'endAt' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface ActionRes {
  success: boolean;
  message: string;
}

export interface DeleteManyDto {
  ids: string[];
}
