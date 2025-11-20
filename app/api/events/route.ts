import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventService } from '@/lib/services/event.service';
import { requireAuth } from '@/lib/utils/auth.util';
import { AppError } from '@/lib/utils/error.util';
import type { UpsertEventDto } from '@/types/event';

const UpsertEventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
});

const ListEventsQuerySchema = z.object({
  search: z.string().optional(),
  startAtFrom: z.string().datetime().optional(),
  startAtTo: z.string().datetime().optional(),
  endAtFrom: z.string().datetime().optional(),
  endAtTo: z.string().datetime().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  sortBy: z.enum(['name', 'startAt', 'endAt', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const query = ListEventsQuerySchema.parse({
      search: searchParams.get('search'),
      startAtFrom: searchParams.get('startAtFrom'),
      startAtTo: searchParams.get('startAtTo'),
      endAtFrom: searchParams.get('endAtFrom'),
      endAtTo: searchParams.get('endAtTo'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    const result = await eventService.listEvents(user.id, query);

    return NextResponse.json({
      success: true,
      message: 'Events retrieved successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 },
      );
    }
    console.error('Error listing events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    );
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          data: null,
          errors: error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 },
      );
    }
    console.error('Error upserting event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    );
  }
}
