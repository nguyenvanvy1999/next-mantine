import type { EntityType } from '@/lib/generated/prisma/enums';
import type { EntityModel } from '@/lib/generated/prisma/models/Entity';
import type {
  ActionRes,
  BaseListQuery,
  DateToString,
  DeleteManyDto,
  PaginationMeta,
} from './common';

export { EntityType } from '@/lib/generated/prisma/enums';

export type EntityResponse = DateToString<
  Pick<
    EntityModel,
    | 'id'
    | 'name'
    | 'type'
    | 'phone'
    | 'email'
    | 'address'
    | 'note'
    | 'created'
    | 'modified'
  >
>;

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

export interface ListEntitiesQuery extends BaseListQuery {
  type?: EntityType[];
  sortBy?: 'name' | 'type' | 'created';
}

export type { PaginationMeta, ActionRes, DeleteManyDto };
