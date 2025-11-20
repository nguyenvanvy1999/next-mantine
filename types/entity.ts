// Entity types matching Prisma schema
export enum EntityType {
  individual = 'individual',
  organization = 'organization',
}

export interface EntityResponse {
  id: string;
  name: string;
  type: EntityType;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  created: string; // ISO date string
  modified: string; // ISO date string
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EntityListResponse {
  entities: EntityResponse[];
  pagination: PaginationMeta;
}

export interface UpsertEntityDto {
  id?: string;
  name: string;
  type: EntityType;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}

export interface ListEntitiesQuery {
  type?: EntityType[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'type' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface ActionRes {
  success: boolean;
  message: string;
}

export interface DeleteManyDto {
  ids: string[];
}
