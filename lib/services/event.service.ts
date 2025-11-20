import dayjs from 'dayjs';
import { prisma } from '@/lib/auth';
import type { Prisma } from '@/lib/generated/prisma/client';
import { DB_PREFIX, ErrorCode, idUtil, throwAppError } from '@/lib/utils';
import { deleteManyResources } from '@/lib/utils/delete-many.util';
import { validateResourceOwnership } from '@/lib/utils/ownership.util';
import { calculatePagination } from '@/lib/utils/pagination.util';
import type {
  EventListResponse,
  EventResponse,
  ListEventsQuery,
  UpsertEventDto,
} from '@/types/event';
import type { BaseServiceDependencies } from './base/base.service';
import { BaseService } from './base/base.service';
import { mapEvent } from './mappers/event.mapper';
import { EVENT_SELECT_FULL, EVENT_SELECT_MINIMAL } from './selects';

export class EventService extends BaseService {
  constructor(deps: BaseServiceDependencies = { db: prisma, idUtil }) {
    super(deps);
  }

  private async validateUniqueName(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const where: Prisma.EventWhereInput = {
      userId,
      name,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    const count = await this.db.event.count({ where });

    if (count > 0) {
      throwAppError(ErrorCode.DUPLICATE_NAME, 'Event name already exists');
    }
  }

  private validateDateRange(startAt: Date, endAt?: Date | null) {
    if (endAt && endAt < startAt) {
      throwAppError(
        ErrorCode.VALIDATION_ERROR,
        'endAt must be greater than or equal to startAt',
      );
    }
  }

  async upsertEvent(
    userId: string,
    data: UpsertEventDto,
  ): Promise<EventResponse> {
    if (data.id) {
      validateResourceOwnership(
        userId,
        data.id,
        this.idUtil,
        ErrorCode.EVENT_NOT_FOUND,
        'Event not found',
      );
    }

    await this.validateUniqueName(userId, data.name, data.id);

    const startAt = dayjs(data.startAt).toDate();
    const endAt = data.endAt ? dayjs(data.endAt).toDate() : null;

    this.validateDateRange(startAt, endAt);

    if (data.id) {
      const event = await this.db.event.update({
        where: { id: data.id },
        data: {
          name: data.name,
          startAt,
          endAt,
        },
        select: EVENT_SELECT_FULL,
      });
      return mapEvent(event);
    } else {
      const event = await this.db.event.create({
        data: {
          id: this.idUtil.dbIdWithUserId(DB_PREFIX.EVENT, userId),
          userId,
          name: data.name,
          startAt,
          endAt,
        },
        select: EVENT_SELECT_FULL,
      });
      return mapEvent(event);
    }
  }

  async getEvent(userId: string, eventId: string): Promise<EventResponse> {
    const event = await this.db.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
      select: EVENT_SELECT_FULL,
    });

    if (!event) {
      throwAppError(ErrorCode.EVENT_NOT_FOUND, 'Event not found');
    }

    return mapEvent(event);
  }

  async listEvents(
    userId: string,
    query: ListEventsQuery,
  ): Promise<EventListResponse> {
    const {
      search,
      startAtFrom,
      startAtTo,
      endAtFrom,
      endAtTo,
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.EventWhereInput = {
      userId,
    };

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (startAtFrom || startAtTo) {
      where.startAt = {};
      if (startAtFrom) {
        where.startAt.gte = dayjs(startAtFrom).toDate();
      }
      if (startAtTo) {
        where.startAt.lte = dayjs(startAtTo).toDate();
      }
    }

    if (endAtFrom || endAtTo) {
      where.endAt = {};
      if (endAtFrom) {
        where.endAt.gte = dayjs(endAtFrom).toDate();
      }
      if (endAtTo) {
        where.endAt.lte = dayjs(endAtTo).toDate();
      }
    }

    type EventSortKey = NonNullable<ListEventsQuery['sortBy']>;
    const orderBy = this.buildOrderBy<
      EventSortKey,
      Prisma.EventOrderByWithRelationInput
    >(sortBy, sortOrder, {
      name: 'name',
      startAt: 'startAt',
      endAt: 'endAt',
      created: 'created',
    }) as Prisma.EventOrderByWithRelationInput | undefined;

    const { skip, take } = calculatePagination(page, limit);

    const [events, total] = await Promise.all([
      this.db.event.findMany({
        where,
        orderBy,
        skip,
        take,
        select: EVENT_SELECT_FULL,
      }),
      this.db.event.count({ where }),
    ]);

    return {
      data: events.map(mapEvent),
      pagination: this.buildPaginationResponse(page, limit, total, [])
        .pagination,
    };
  }

  deleteManyEvents(userId: string, ids: string[]) {
    return deleteManyResources({
      db: this.db,
      model: 'event',
      userId,
      ids,
      selectMinimal: EVENT_SELECT_MINIMAL,
      errorCode: ErrorCode.EVENT_NOT_FOUND,
      errorMessage: 'Some events were not found or do not belong to you',
      resourceName: 'event',
    });
  }
}

export const eventService = new EventService();
