import type { EventModel } from '@/lib/generated/prisma/models/Event';
import type {
  ActionRes,
  BaseListQuery,
  DateToString,
  DeleteManyDto,
  PaginationMeta,
} from './common';

export type EventResponse = DateToString<
  Pick<EventModel, 'id' | 'name' | 'startAt' | 'endAt' | 'created' | 'modified'>
>;

export interface EventListResponse {
  data: EventResponse[];
  pagination: PaginationMeta;
}

export interface UpsertEventDto {
  id?: string;
  name: string;
  startAt: string;
  endAt?: string;
}

export interface ListEventsQuery extends BaseListQuery {
  startAtFrom?: string;
  startAtTo?: string;
  endAtFrom?: string;
  endAtTo?: string;
  sortBy?: 'name' | 'startAt' | 'endAt' | 'created';
}

export type { PaginationMeta, ActionRes, DeleteManyDto };
