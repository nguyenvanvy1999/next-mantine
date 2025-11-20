import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventService } from '@/lib/services/event.service';
import {
  createSortByParam,
  handleApiError,
  paginationParams,
  parseQueryParams,
  sortOrderParam,
} from '@/lib/utils';
import { requireAuth } from '@/lib/utils/auth.util';
import type { UpsertEventDto } from '@/types/event';

const UpsertEventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
});

const eventSortFields = ['name', 'startAt', 'endAt', 'created'] as const;

const ListEventsQuerySchema = z.object({
  search: z.string().optional(),
  startAtFrom: z.string().datetime().optional(),
  startAtTo: z.string().datetime().optional(),
  endAtFrom: z.string().datetime().optional(),
  endAtTo: z.string().datetime().optional(),
  ...paginationParams,
  ...createSortByParam(eventSortFields),
  ...sortOrderParam,
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const query = parseQueryParams(ListEventsQuerySchema, request);

    const result = await eventService.listEvents(user.id, query);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error listing events:',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = UpsertEventSchema.parse(body);
    const data: UpsertEventDto = {
      ...parsed,
    };
    const result = await eventService.upsertEvent(user.id, data);

    return NextResponse.json({
      success: true,
      message: data.id
        ? 'Event updated successfully'
        : 'Event created successfully',
      data: result,
    });
  } catch (error) {
    return handleApiError(error, {
      logMessage: 'Error upserting event:',
    });
  }
}
