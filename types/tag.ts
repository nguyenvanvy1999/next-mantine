export interface TagResponse {
  id: string;
  name: string;
  description: string | null;
  created: string; // ISO date string
  modified: string; // ISO date string
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TagListResponse {
  tags: TagResponse[];
  pagination: PaginationMeta;
}

export interface UpsertTagDto {
  id?: string;
  name: string;
  description?: string;
}

export interface ListTagsQuery {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface ActionRes {
  success: boolean;
  message: string;
}

export interface DeleteManyDto {
  ids: string[];
}
