import type { TagModel } from '@/lib/generated/prisma/models/Tag';
import type {
  ActionRes,
  BaseListQuery,
  DateToString,
  DeleteManyDto,
  PaginationMeta,
} from './common';

export type TagResponse = DateToString<
  Pick<TagModel, 'id' | 'name' | 'description' | 'created' | 'modified'>
>;

export interface TagListResponse {
  data: TagResponse[];
  pagination: PaginationMeta;
}

export interface UpsertTagDto {
  id?: string;
  name: string;
  description?: string;
}

export interface ListTagsQuery extends BaseListQuery {
  sortBy?: 'name' | 'created';
}

export type { PaginationMeta, ActionRes, DeleteManyDto };
